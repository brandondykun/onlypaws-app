import Feather from "@expo/vector-icons/Feather";
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

const RegisterScreen = () => {
  const { authenticate } = useAuthUserContext();
  const { isDarkMode } = useColorMode();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleCreateAccount = async () => {
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasErrors = false;

    if (!email) {
      setEmailError("Please enter an email.");
      hasErrors = true;
    }

    if (!username) {
      setUsernameError("Please enter a username.");
      hasErrors = true;
    }

    if (!password) {
      setPasswordError("Please enter a password.");
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

    const { error, data } = await registerUser(email, password, username);

    if (!error && data) {
      const { error: loginError, data: loginData } = await login(email, password);
      if (!loginError && loginData) {
        await SecureStore.setItemAsync("ACCESS_TOKEN", loginData.access);
        await SecureStore.setItemAsync("REFRESH_TOKEN", loginData.refresh);

        const { data: myInfoData, error: myInfoError } = await getMyInfo();

        if (!myInfoError && myInfoData) {
          authenticate(myInfoData);
          setSubmitLoading(false);
        }

        router.replace("/(app)/");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error creating your account. Please try again.",
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error creating your account. Please try again.",
      });
    }
    setSubmitLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={s.root}>
      <Text style={s.title} darkColor={COLORS.zinc[300]}>
        OnlyPaws
      </Text>
      <View style={s.icon}>
        <Ionicons name="paw" size={64} color={isDarkMode ? COLORS.zinc[700] : COLORS.zinc[200]} />
      </View>
      <View style={s.inputsContainer}>
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          error={usernameError}
          placeholder="AwesomeUsername"
          icon={<Feather name="user" size={20} color={COLORS.zinc[500]} />}
          autoCapitalize="none"
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          placeholder="youremail@email.com"
          icon={<Ionicons name="at-sharp" size={20} color={COLORS.zinc[500]} />}
          autoCapitalize="none"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          placeholder="*********"
          icon={<Ionicons name="key-outline" size={20} color={COLORS.zinc[500]} />}
          autoCapitalize="none"
          secureTextEntry
        />
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={confirmPasswordError}
          placeholder="*********"
          icon={<Ionicons name="key-outline" size={20} color={COLORS.zinc[500]} />}
          autoCapitalize="none"
          secureTextEntry
        />
      </View>

      <Button text="Create Account" onPress={handleCreateAccount} loading={submitLoading} />

      <View style={s.helperTextContainer}>
        <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18 }}>
          Already have an account?
        </Text>
        <Button text="Log in" variant="text" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const s = StyleSheet.create({
  root: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 96,
  },
  title: {
    textAlign: "center",
    fontSize: 36,
    marginBottom: 36,
    fontStyle: "italic",
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
  },
});
