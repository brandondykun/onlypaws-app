import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { OtpInputRef } from "react-native-otp-entry";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resetPassword } from "@/api/auth";
import SubtleMeshBackground from "@/components/Backgrounds/SubtleMeshBackground";
import Button from "@/components/Button/Button";
import OtpInput from "@/components/OtpInput/OtpInput";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";
import toast from "@/utils/toast";

const ResetPasswordScreen = () => {
  const { isDarkMode, setLightOrDark } = useColorMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();

  const otpInputRef = useRef<OtpInputRef>(null);

  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmationCodeError, setConfirmationCodeError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  // handle resetting password
  const handleSubmit = async () => {
    setConfirmationCodeError("");
    setNewPasswordError("");
    setConfirmNewPasswordError("");

    let hasErrors = false;

    if (!confirmationCode) {
      setConfirmationCodeError("Please enter the confirmation code.");
      hasErrors = true;
    }

    if (!newPassword) {
      setNewPasswordError("Please enter a new password.");
      hasErrors = true;
    }

    if (!confirmNewPassword) {
      setConfirmNewPasswordError("Please confirm your new password.");
      hasErrors = true;
    }

    if (newPassword !== confirmNewPassword) {
      setNewPasswordError("Passwords do not match.");
      setConfirmNewPasswordError("Passwords do not match.");
      hasErrors = true;
    }

    if (newPassword.length < 9) {
      setNewPasswordError("Password must be at least 9 characters long.");
      hasErrors = true;
    }

    if (hasErrors) return;
    setLoading(true);

    const { error } = await resetPassword(email, confirmationCode, newPassword);

    console.log("ERROR: ", error);

    if (error) {
      if (error === "Reset token has expired") {
        // handle expired reset token
        setConfirmationCodeError("Confirmation code has expired.");
      } else if (error === "Invalid confirmation code") {
        // handle invalid reset token
        setConfirmationCodeError("Invalid confirmation code.");
      } else if (error === "Ensure this field has at least 9 characters.") {
        // handle password too short
        setNewPasswordError("Password must be at least 9 characters long.");
      } else {
        // handle other errors
        toast.error("An error occurred while resetting your password. Please try again.", { visibilityTime: 10000 });
      }
    } else {
      router.push("/auth/login");
      toast.success("Password reset successful. You can now log in with your new password.", { visibilityTime: 10000 });
    }
    setLoading(false);
  };

  return (
    <View style={s.root}>
      <SubtleMeshBackground />
      <ScrollView
        contentContainerStyle={s.scrollView}
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} height={70} width={200} />
          </View>
          <Text
            darkColor={COLORS.zinc[300]}
            lightColor={COLORS.zinc[700]}
            style={{ fontSize: 20, textAlign: "center", fontWeight: "300", marginBottom: 24 }}
          >
            We sent a confirmation code to {email}
          </Text>
          <Text
            darkColor={COLORS.zinc[400]}
            lightColor={COLORS.zinc[700]}
            style={{ fontSize: 16, textAlign: "center", fontWeight: "300" }}
          >
            Please enter the confirmation code.
          </Text>
          <View style={s.inputsContainer}>
            <View style={{ marginBottom: 24 }}>
              <OtpInput
                ref={otpInputRef}
                setOtpCode={(val) => {
                  setConfirmationCodeError("");
                  setConfirmationCode(val);
                }}
                error={confirmationCodeError}
              />
            </View>
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              error={newPasswordError}
              placeholder="newPassword123!"
              icon={
                <Ionicons name="key-outline" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[500])} />
              }
              autoCapitalize="none"
              secureTextEntry
            />
            <TextInput
              label="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              error={confirmNewPasswordError}
              placeholder="newPassword123!"
              icon={
                <Ionicons name="key-outline" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[500])} />
              }
              autoCapitalize="none"
              secureTextEntry
            />
          </View>

          <Button text="Submit" onPress={handleSubmit} loading={loading} testID="reset-password-button" />

          <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: insets.bottom }}>
            <Button text="Back" variant="text" onPress={() => router.back()} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ResetPasswordScreen;

const s = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 96,
  },
  inputsContainer: {
    gap: 8,
    marginTop: 12,
    marginBottom: 36,
  },
});
