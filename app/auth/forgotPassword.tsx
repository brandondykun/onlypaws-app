import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { requestResetPasswordToken } from "@/api/auth";
import SubtleMeshBackground from "@/components/Backgrounds/SubtleMeshBackground";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";

const ForgotPasswordScreen = () => {
  const { isDarkMode, setLightOrDark } = useColorMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setEmailError("");

    let hasErrors = false;

    if (!email) {
      setEmailError("Please enter your email.");
      hasErrors = true;
    }

    if (hasErrors) return;
    setLoading(true);

    const { error, status } = await requestResetPasswordToken(email);
    if (error) {
      if (status === 500) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occurred while requesting a password reset. Please try again.",
          visibilityTime: 10000,
        });
      } else {
        setEmailError(error);
      }
    } else {
      router.push({
        pathname: "/auth/resetPassword",
        params: { email },
      });
    }
    setLoading(false);
  };

  return (
    <View style={s.root}>
      <SubtleMeshBackground />
      <ScrollView contentContainerStyle={s.scrollView}>
        <View style={{ flex: 1 }}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} height={70} width={200} />
          </View>
          <Text
            darkColor={COLORS.zinc[200]}
            lightColor={COLORS.zinc[900]}
            style={{ fontSize: 28, textAlign: "center", fontWeight: "300", marginBottom: 36 }}
          >
            Password Reset
          </Text>
          <Text
            darkColor={COLORS.zinc[300]}
            lightColor={COLORS.zinc[700]}
            style={{ fontSize: 18, textAlign: "center", fontWeight: "300" }}
          >
            Please enter your account email. We will send you a code to reset your password.
          </Text>

          <View style={s.inputsContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              placeholder="youremail@email.com"
              icon={<Ionicons name="at-sharp" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[500])} />}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <Button text="Submit" onPress={handleSubmit} loading={loading} testID="submit-button" />

          <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: insets.bottom }}>
            <Button text="Back" variant="text" onPress={() => router.back()} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ForgotPasswordScreen;

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
    marginVertical: 24,
  },
});
