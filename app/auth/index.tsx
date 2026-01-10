import { Redirect, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import SubtleMeshBackground from "@/components/Backgrounds/SubtleMeshBackground";
import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import OnlyPawsLogo from "@/svg/OnlyPawsLogo";
import PawLogo from "@/svg/PawLogo";

const LandingScreen = () => {
  const router = useRouter();

  const { isDarkMode } = useColorMode();
  const { isAuthenticated, user } = useAuthUserContext();

  // when registering there is a screen bug that send navigation back to this root screen
  // this check will redirect to verify email screen if user is authenticated and email is not verified
  if (isAuthenticated && !user.is_email_verified) {
    return <Redirect href="/auth/verifyEmail" />;
  }

  return (
    <View style={s.root}>
      <SubtleMeshBackground />
      <ScrollView contentContainerStyle={s.scrollView}>
        <View style={{ flex: 1 }}>
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <OnlyPawsLogo mode={isDarkMode ? "dark" : "light"} width={300} height={100} />
          </View>
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <PawLogo height={150} width={150} mode={isDarkMode ? "dark" : "light"} />
          </View>
          <Text style={{ fontSize: 28, fontWeight: "200", marginBottom: 8, textAlign: "center" }}>
            Your{" "}
            <Text darkColor={COLORS.sky[600]} lightColor={COLORS.sky[500]} style={{ fontWeight: "500" }}>
              pets
            </Text>{" "}
            deserve this.
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "200", textAlign: "center" }}>
            <Text darkColor={COLORS.sky[600]} lightColor={COLORS.sky[500]} style={{ fontWeight: "500" }}>
              You
            </Text>{" "}
            deserve this.
          </Text>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ alignItems: "center", paddingBottom: 92, gap: 24 }}>
              <Button
                text="Log in"
                variant="text"
                onPress={() => router.push("/auth/login")}
                textStyle={{ fontSize: 20, fontWeight: 500, color: isDarkMode ? COLORS.sky[600] : COLORS.sky[500] }}
              />
              <Text darkColor={COLORS.zinc[500]} style={{ fontSize: 18 }}>
                - or -
              </Text>
              <Button
                text="Create an Account"
                variant="text"
                onPress={() => router.navigate("/auth/register")}
                textStyle={{ fontSize: 20, fontWeight: 400 }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LandingScreen;

const s = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 96,
  },
  title: {
    textAlign: "center",
    fontSize: 48,
    marginBottom: 36,
    fontStyle: "italic",
  },
});
