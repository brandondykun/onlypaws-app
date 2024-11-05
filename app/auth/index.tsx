import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import Button from "@/components/Button/Button";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const LandingScreen = () => {
  const router = useRouter();

  const { isDarkMode } = useColorMode();

  return (
    <ScrollView contentContainerStyle={s.root}>
      <View style={{ flex: 1 }}>
        <Text style={s.title} darkColor={COLORS.zinc[300]}>
          OnlyPaws
        </Text>
        <Text darkColor={COLORS.zinc[400]} style={{ fontSize: 18, textAlign: "center", fontWeight: "200" }}>
          Pet lovers,
        </Text>
        <Text
          darkColor={COLORS.zinc[400]}
          style={{ fontSize: 18, paddingBottom: 36, textAlign: "center", fontWeight: "200" }}
        >
          welcome to your forever home.
        </Text>
        <View style={s.icon}>
          <Ionicons name="paw" size={86} color={isDarkMode ? COLORS.zinc[700] : COLORS.zinc[200]} />
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
  );
};

export default LandingScreen;

const s = StyleSheet.create({
  root: {
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
  icon: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 48,
  },
});
