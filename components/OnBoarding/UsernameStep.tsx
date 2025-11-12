import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";

import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { verifyUsername } from "@/utils/utils";

type UsernameStepProps = {
  onNext: () => Promise<string | null>;
  loading: boolean;
  usernameError: string;
  setUsernameError: (error: string) => void;
  username: string;
  setUsername: (username: string) => void;
};

const UsernameStep = ({
  onNext,
  loading,
  usernameError,
  setUsernameError,
  username,
  setUsername,
}: UsernameStepProps) => {
  const { setLightOrDark } = useColorMode();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback(() => {
    return new Promise<void>((resolve) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }, [fadeAnim]);

  const handleNext = async () => {
    setUsernameError("");

    // Client-side validation first
    const usernameValidationError = verifyUsername(username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      return;
    }

    // Call onNext first and wait for it to complete
    const error = await onNext();
    if (error) {
      // If there's an error, keep the component visible and show the error
      setUsernameError(error);
      return;
    }

    // Only fade out if there's no error (success case)
    // Disable button during fade out to prevent re-clicking
    setIsTransitioning(true);
    await fadeOut();
  };

  const handleChangeText = (text: string) => {
    setUsername(text);
    setUsernameError("");
  };

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={{ paddingBottom: 24, gap: 16 }}>
        <Text
          style={{ fontSize: 26, fontWeight: "500", textAlign: "center" }}
          darkColor={COLORS.zinc[100]}
          lightColor={COLORS.zinc[500]}
        >
          Choose your username
        </Text>
        <Text
          style={{ fontSize: 18, fontWeight: "300", textAlign: "center" }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[700]}
        >
          This will be your unique identifier on OnlyPaws
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 24 }}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={handleChangeText}
            error={usernameError ? " " : undefined}
            autoCapitalize="none"
            placeholder="BarkTwain"
            icon={<MaterialIcons name="person" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[500])} />}
            autoCorrect={false}
            autoComplete="off"
          />
        </View>
        <View>
          {usernameError && (
            <Text darkColor={COLORS.red[500]} lightColor={COLORS.red[600]} style={s.errorText}>
              {usernameError}
            </Text>
          )}
        </View>
      </View>

      <Button text="Next" onPress={handleNext} loading={loading || isTransitioning} />
    </Animated.View>
  );
};

export default UsernameStep;

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    flexGrow: 1,
  },
  errorText: {
    fontWeight: "300",
    fontSize: 18,
    marginTop: 4,
    textAlign: "center",
  },
});
