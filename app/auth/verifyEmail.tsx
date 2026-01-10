import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { OtpInputRef } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { verifyEmail, resendVerifyEmail } from "@/api/auth";
import SubtleMeshBackground from "@/components/Backgrounds/SubtleMeshBackground";
import Button from "@/components/Button/Button";
import OtpInput from "@/components/OtpInput/OtpInput";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const VerifyEmailScreen = () => {
  const { user, updateEmailVerified } = useAuthUserContext();

  const router = useRouter();
  const otpInputRef = useRef<OtpInputRef>(null);

  const { setLightOrDark } = useColorMode();
  const [otpCode, setOtpCode] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleSubmit = async () => {
    if (otpCode.length < 6) return;
    setSubmitLoading(true);
    setSubmitError("");

    const { error, status } = await verifyEmail(otpCode);
    if (!error && status === 200) {
      updateEmailVerified(true);
      otpInputRef.current?.clear();

      // Navigate based on whether user has profiles
      if (!user.profiles || user.profiles.length === 0) {
        router.replace("../onboarding/");
      } else {
        router.replace("/(app)/(index)");
      }
    } else if (error) {
      setSubmitError(error);
    }

    setSubmitLoading(false);
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendError("");
    setSubmitError("");
    setOtpCode("");
    otpInputRef.current?.clear();

    if (user.id) {
      const { error, status } = await resendVerifyEmail(user.id);
      if (!error && status === 201) {
        Toast.show({
          type: "success",
          text1: "Email Sent",
          text2: "Please check your email for the new code.",
          visibilityTime: 7000,
        });
      } else if (error) {
        setResendError(error);
      }
    }
    setResendLoading(false);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <SubtleMeshBackground />
      <ScrollView
        contentContainerStyle={s.scrollRoot}
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 12 }}>
          <Text style={s.header} darkColor={COLORS.sky[400]} lightColor={COLORS.sky[500]}>
            Email Verification
          </Text>
          <View style={s.shieldIconContainer}>
            <Ionicons
              name="shield-checkmark-sharp"
              size={54}
              color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[200])}
            />
          </View>
          <Text style={s.subHeader} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]}>
            An email has been sent to:
          </Text>
          <Text style={s.email} darkColor={COLORS.zinc[100]} lightColor={COLORS.zinc[900]}>
            {user.email}
          </Text>
          <Text style={s.subHeader} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]}>
            Please check your email and enter the provided verification code below.
          </Text>
        </View>
        <View style={s.inputContainer}>
          <OtpInput ref={otpInputRef} setOtpCode={setOtpCode} />
        </View>
        <View>
          {submitError && (
            <Text darkColor={COLORS.red[500]} lightColor={COLORS.red[500]} style={[s.errorText, { marginBottom: 12 }]}>
              {submitError}
            </Text>
          )}
          {resendError && (
            <Text darkColor={COLORS.red[500]} lightColor={COLORS.red[500]} style={s.errorText}>
              {resendError}
            </Text>
          )}
        </View>
        <View style={s.resendButtonContainer}>
          <Button
            text="Resend Code"
            variant="text"
            textStyle={{ fontSize: 20 }}
            onPress={handleResendCode}
            loading={resendLoading}
          />
        </View>
        <View style={{ paddingHorizontal: 4, marginTop: 24 }}>
          <Button text="Submit" onPress={handleSubmit} disabled={otpCode.length < 6} loading={submitLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyEmailScreen;

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: "relative",
  },
  scrollRoot: {
    paddingHorizontal: 16,
    flex: 1,
    paddingTop: 24,
    paddingBottom: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  subHeader: {
    textAlign: "center",
    marginBottom: 18,
    fontSize: 18,
    paddingHorizontal: 12,
    fontWeight: "300",
  },
  email: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    gap: 12,
  },
  resendButtonContainer: {
    paddingBottom: 48,
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  errorText: {
    textAlign: "center",
    fontSize: 18,
    paddingHorizontal: 12,
  },
  shieldIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
});
