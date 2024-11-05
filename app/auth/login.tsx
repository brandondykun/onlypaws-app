import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { login, getMyInfo } from "@/api/auth";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";

const LoginScreen = () => {
  const { authenticate, logOut } = useAuthUserContext();
  const { isDarkMode } = useColorMode();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    let hasErrors = false;
    setPasswordError("");
    setEmailError("");

    if (!email) {
      setEmailError("Please enter your email.");
      hasErrors = true;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      hasErrors = true;
    }

    if (hasErrors) return;

    setLoginLoading(true);

    const { error, data, status } = await login(email, password);
    if (data && !error) {
      await SecureStore.setItemAsync("ACCESS_TOKEN", data.access);
      await SecureStore.setItemAsync("REFRESH_TOKEN", data.refresh);

      const { data: myInfoData, error: myInfoError } = await getMyInfo();

      if (myInfoData && !myInfoError) {
        authenticate(myInfoData);
        setLoginLoading(false);
        router.replace("/(app)/");
      } else {
        logOut();
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error logging you in. Please try again",
          visibilityTime: 10000,
        });
      }
    } else {
      if (status === 401) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid credentials. Please try again.",
          visibilityTime: 10000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error logging you in. Please try again",
          visibilityTime: 10000,
        });
      }
    }
    setLoginLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={s.root}>
      <View>
        <Text style={s.title} darkColor={COLORS.zinc[300]}>
          OnlyPaws
        </Text>
        <View style={s.icon}>
          <Ionicons name="paw" size={64} color={isDarkMode ? COLORS.zinc[700] : COLORS.zinc[200]} />
        </View>

        <View style={s.inputsContainer}>
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
        </View>

        <Button text="Log In" onPress={handleLogin} loading={loginLoading} />

        <View style={s.helperTextContainer}>
          <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18 }}>
            Don't have an account?
          </Text>
          <Button text="Register" variant="text" onPress={() => router.push("/auth/register")} />
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

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
