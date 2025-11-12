import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

import { login, registerUser } from "@/api/auth";
import { getMyInfo } from "@/api/auth";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";

const RegisterScreen = () => {
  const { authenticate } = useAuthUserContext();
  const { isDarkMode, setLightOrDark } = useColorMode();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleCreateAccount = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasErrors = false;

    if (!email) {
      setEmailError("Please enter an email.");
      hasErrors = true;
    }

    if (!password) {
      setPasswordError("Please enter a password.");
      hasErrors = true;
    }

    if (password.length < 9) {
      setPasswordError("Password must be at least 9 characters.");
      hasErrors = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      hasErrors = true;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setConfirmPasswordError("Passwords do not match.");
      hasErrors = true;
    }

    if (hasErrors) return;

    setSubmitLoading(true);

    const { error, data } = await registerUser(email, password);

    if (!error && data) {
      const { error: loginError, data: loginData } = await login(email, password);
      if (!loginError && loginData) {
        await SecureStore.setItemAsync("ACCESS_TOKEN", loginData.access);
        await SecureStore.setItemAsync("REFRESH_TOKEN", loginData.refresh);

        const { data: myInfoData, error: myInfoError } = await getMyInfo();

        if (!myInfoError && myInfoData) {
          authenticate(myInfoData);
          setSubmitLoading(false);
          // Navigate to email verification
          router.replace("/auth/verifyEmail");
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Your account was created, but there was an error logging you in. Please log in manually.",
          });
          router.replace("/auth/login");
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Your account was created, but there was an error logging you in. Please log in manually.",
        });
        router.replace("/auth/login");
      }
    } else {
      // handle errors here
      if (error?.email) {
        setEmailError(error.email[0]);
      }
      if (error?.password) {
        setPasswordError(error.password[0]);
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error creating your account. Please try again.",
      });
    }
    setSubmitLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={s.root} automaticallyAdjustKeyboardInsets showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: "center" }}>
        <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} height={70} width={200} />
      </View>
      <View style={s.inputsContainer}>
        <View style={{ marginBottom: 24 }}>
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
          <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.helperText}>
            * Choose an email you can access to verify your account.
          </Text>
          <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.helperText}>
            * Your email will not be visible to other users.
          </Text>
        </View>

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          placeholder="*********"
          icon={<Ionicons name="key-outline" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[500])} />}
          autoCapitalize="none"
          secureTextEntry
        />
        <View style={{ marginBottom: 24 }}>
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmPasswordError}
            placeholder="*********"
            icon={<Ionicons name="key-outline" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[500])} />}
            autoCapitalize="none"
            secureTextEntry
          />
          <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.helperText}>
            * Password must be at least 9 characters.
          </Text>
        </View>
      </View>

      <Button text="Create Account" onPress={handleCreateAccount} loading={submitLoading} />

      <View style={s.helperTextContainer}>
        <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18 }}>
          Already have an account?
        </Text>
        <Button text="Log in" variant="text" onPress={() => router.replace("/auth/login")} />
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const s = StyleSheet.create({
  root: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 72,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  inputsContainer: {
    gap: 8,
    marginVertical: 24,
  },
  helperTextContainer: {
    marginTop: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  helperText: {
    fontStyle: "italic",
    fontWeight: "300",
  },
});
