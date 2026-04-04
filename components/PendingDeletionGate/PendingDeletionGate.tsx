import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cancelAccountDeletion, logOut as logOutApi } from "@/api/auth";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import * as tokenService from "@/services/tokenService";
import toast from "@/utils/toast";

const PendingDeletionGate = () => {
  const { isDarkMode, setLightOrDark } = useColorMode();
  const { user, clearPendingDeletion, logOut } = useAuthUserContext();
  const insets = useSafeAreaInsets();

  const [recoverLoading, setRecoverLoading] = useState(false);
  const [logOutLoading, setLogOutLoading] = useState(false);

  const daysRemaining = user.pending_deletion?.days_remaining ?? 0;

  const handleRecover = async () => {
    setRecoverLoading(true);
    const { error } = await cancelAccountDeletion();
    if (error) {
      toast.error("Failed to recover account. Please try again.");
      setRecoverLoading(false);
      return;
    }
    clearPendingDeletion();
    toast.success("Account recovered successfully.");
    setRecoverLoading(false);
  };

  const handleLogOut = async () => {
    setLogOutLoading(true);
    const refreshToken = await tokenService.getRefreshToken();
    if (refreshToken) {
      await logOutApi(refreshToken);
    }
    await logOut();
  };

  return (
    <ScrollView
      contentContainerStyle={[
        s.container,
        {
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[100],
          paddingTop: insets.top + 64,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={s.content}>
        <Ionicons name="warning-outline" size={48} color={setLightOrDark(COLORS.red[600], COLORS.red[500])} />

        <Text style={s.title} darkColor={COLORS.red[500]} lightColor={COLORS.red[600]}>
          Account Scheduled for Deletion
        </Text>

        <Text style={s.subtitle} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          Your account and all associated data will be permanently deleted in{" "}
          <Text style={s.daysText} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[900]}>
            {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
          </Text>
          . If you'd like to keep your account, you can recover it below.
        </Text>

        <View style={s.buttons}>
          <Button text="Recover Account" onPress={handleRecover} loading={recoverLoading} disabled={logOutLoading} />
          <View style={s.logOutButtonContainer}>
            <Button
              text="Log Out"
              variant="text"
              onPress={handleLogOut}
              loading={logOutLoading}
              disabled={recoverLoading}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PendingDeletionGate;

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  content: {
    gap: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  daysText: {
    fontWeight: "700",
    fontSize: 16,
  },
  buttons: {
    gap: 12,
    width: "100%",
    marginTop: 48,
    justifyContent: "space-between",
    flexGrow: 1,
  },
  logOutButtonContainer: {
    alignItems: "center",
  },
});
