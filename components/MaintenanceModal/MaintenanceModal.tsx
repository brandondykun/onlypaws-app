/**
 * MaintenanceModal - Full-screen blocking modal displayed when the app is in maintenance mode.
 * Shows the maintenance message from the backend and an optional estimated end time.
 * Includes a retry button to check if maintenance has ended.
 */

import Entypo from "@expo/vector-icons/Entypo";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useMaintenance } from "@/context/MaintenanceContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";

import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import Text from "../Text/Text";

const DEFAULT_MESSAGE = "We're currently performing scheduled maintenance. Please check back shortly.";

/**
 * Format ISO date string to a user-friendly format.
 * Example: "Jan 15, 2026 at 3:30 PM"
 */
const formatEstimatedEndTime = (isoString: string): string | null => {
  try {
    const date = new Date(isoString);

    // Check for invalid date
    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return null;
  }
};

const MaintenanceModal = () => {
  const { isInMaintenance, message, estimatedEndTime, checkSystemStatus } = useMaintenance();
  const { setLightOrDark, isDarkMode } = useColorMode();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [isRetrying, setIsRetrying] = useState(false);

  const backgroundColor = setLightOrDark(COLORS.zinc[200], COLORS.zinc[950]);
  const iconColor = setLightOrDark(COLORS.zinc[400], COLORS.zinc[800]);
  const subtitleColor = setLightOrDark(COLORS.zinc[600], COLORS.zinc[400]);

  const displayMessage = message || DEFAULT_MESSAGE;
  const formattedEndTime = estimatedEndTime ? formatEstimatedEndTime(estimatedEndTime) : null;

  /**
   * Retry checking system status via the context.
   * The context handles determining if still in maintenance or operational.
   */
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await checkSystemStatus();
    } finally {
      setIsRetrying(false);
    }
  }, [checkSystemStatus]);

  if (!isInMaintenance) {
    return null;
  }

  return (
    <Modal visible={isInMaintenance} withScroll={false} raw transparent={false} animationType="fade">
      <View
        style={[
          s.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, backgroundColor: backgroundColor },
        ]}
      >
        {/* Main Content Above Check Again Button */}
        <View>
          {/* Logo */}
          <View style={s.logoContainer}>
            <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} width={200} height={70} />
          </View>
          {/* Tools Icon */}
          <View style={s.toolsIconContainer}>
            <Entypo name="tools" size={width * 0.4} color={iconColor} />
          </View>

          {/* Title */}
          <View style={s.titleContainer}>
            <Text style={s.title} darkColor={COLORS.zinc[50]} lightColor={COLORS.zinc[900]}>
              Hang on,
            </Text>
            <Text style={s.title} darkColor={COLORS.zinc[50]} lightColor={COLORS.zinc[900]}>
              we're doing some maintenance!
            </Text>
          </View>

          {/* Message */}
          <Text style={s.message} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            {displayMessage}
          </Text>

          {/* Patience Message */}
          <Text style={s.message} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            We appreciate your patience.
          </Text>

          {/* Estimated End Time */}
          {formattedEndTime && (
            <View style={s.estimatedTimeContainer}>
              <Text style={s.estimatedTimeLabel} darkColor={subtitleColor} lightColor={subtitleColor}>
                Estimated return:
              </Text>
              <Text style={s.estimatedTimeValue} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[800]}>
                {formattedEndTime}
              </Text>
            </View>
          )}
        </View>

        {/* Retry Button */}
        <View style={s.buttonContainer}>
          <Button
            text="Check Again"
            onPress={handleRetry}
            loading={isRetrying}
            disabled={isRetrying}
            variant="text"
            buttonStyle={{ paddingHorizontal: 16 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default MaintenanceModal;

const s = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  toolsIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 36,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  estimatedTimeContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  estimatedTimeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  estimatedTimeValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 16,
    alignItems: "center",
  },
});
