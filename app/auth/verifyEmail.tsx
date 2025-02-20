import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { verifyEmail, resendVerifyEmail } from "@/api/auth";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const VerifyEmailScreen = () => {
  const { user, updateEmailVerified } = useAuthUserContext();

  const router = useRouter();

  const { setLightOrDark } = useColorMode();

  const [verifyCode, setVerifyCode] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleSubmit = async () => {
    if (verifyCode.length < 6) return;
    setSubmitLoading(true);
    setSubmitError("");

    const { error, status } = await verifyEmail(verifyCode);
    if (!error && status === 200) {
      updateEmailVerified(true);
      router.replace("/(app)/(index)");
      Toast.show({
        type: "success",
        text1: "Verification Successful",
        text2: "Email verified. Welcome to OnlyPaws!",
        visibilityTime: 7000,
      });
    } else if (error) {
      setSubmitError(error);
    }

    setSubmitLoading(false);
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendError("");
    setSubmitError("");
    setVerifyCode("");

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
      <ScrollView contentContainerStyle={s.scrollRoot}>
        <View style={{ marginBottom: 24 }}>
          <Text style={s.header} darkColor={COLORS.sky[400]} lightColor={COLORS.sky[600]}>
            Email Verification
          </Text>
          <View style={s.shieldIconContainer}>
            <Ionicons
              name="shield-checkmark-sharp"
              size={64}
              color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[200])}
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
          <TextInput
            value={verifyCode}
            onChangeText={setVerifyCode}
            label="Verification Code"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
          />
          <Button text="Verify" onPress={handleSubmit} disabled={verifyCode.length < 6} loading={submitLoading} />
        </View>
        <View style={s.errorTextContainer}>
          <Text darkColor={COLORS.red[500]} style={[s.errorText, { marginBottom: 12 }]}>
            {submitError}
          </Text>
          <Text darkColor={COLORS.red[500]} style={s.errorText}>
            {resendError}
          </Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyEmailScreen;

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollRoot: {
    paddingHorizontal: 12,
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    fontSize: 28,
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
    marginBottom: 48,
    gap: 12,
  },
  resendButtonContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
  },
  errorText: {
    textAlign: "center",
    fontSize: 20,
  },
  errorTextContainer: {
    height: 100,
  },
  shieldIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
});
