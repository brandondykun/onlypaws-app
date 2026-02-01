import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { login, getMyInfo } from "@/api/auth";
import SubtleMeshBackground from "@/components/Backgrounds/SubtleMeshBackground";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import TextInput from "@/components/TextInput/TextInput";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";
import PawLogo from "@/svg/PawLogo";
import toast from "@/utils/toast";

const LoginScreen = () => {
  const { authenticate, logOut } = useAuthUserContext();
  const { isDarkMode, setLightOrDark } = useColorMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        if (!myInfoData.is_email_verified) {
          router.push("/auth/verifyEmail");
        } else {
          router.replace("/(app)/(index)");
        }
      } else {
        logOut();
        toast.error("There was an error logging you in. Please try again", { visibilityTime: 10000 });
      }
    } else {
      if (status === 401) {
        toast.error("Invalid credentials. Please try again.", { visibilityTime: 10000 });
      } else {
        toast.error("There was an error logging you in. Please try again", { visibilityTime: 10000 });
      }
    }
    setLoginLoading(false);
  };

  return (
    <View style={s.root}>
      <SubtleMeshBackground />
      <ScrollView contentContainerStyle={s.scrollView}>
        <View style={{ flex: 1 }}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} height={70} width={200} />
          </View>
          <View style={s.icon}>
            <PawLogo mode={isDarkMode ? "dark" : "light"} height={100} width={100} />
          </View>

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
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              placeholder="*********"
              icon={
                <Ionicons name="key-outline" size={20} color={setLightOrDark(COLORS.zinc[800], COLORS.zinc[500])} />
              }
              autoCapitalize="none"
              secureTextEntry
              testID="login-password"
            />
          </View>

          <Button text="Log In" onPress={handleLogin} loading={loginLoading} testID="login-button" />

          <View style={s.helperTextContainer}>
            <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18 }}>
              Don't have an account?
            </Text>
            <Button text="Register" variant="text" onPress={() => router.replace("/auth/register")} />
          </View>
          <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: insets.bottom }}>
            <Button text="Reset Password" variant="text" onPress={() => router.push("/auth/forgotPassword")} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

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
  icon: {
    alignItems: "center",
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
