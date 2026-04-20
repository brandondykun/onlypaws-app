import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const MissingProfileInfoMessage = () => {
  const { setLightOrDark } = useColorMode();
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        s.container,
        {
          borderColor: setLightOrDark(COLORS.sky[200], `${COLORS.sky[800]}66`),
          backgroundColor: setLightOrDark(COLORS.sky[50], `${COLORS.sky[950]}33`),
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() => router.push("/(app)/profile/editProfile")}
    >
      <View style={s.content}>
        <View
          style={[
            s.iconContainer,
            { backgroundColor: setLightOrDark(COLORS.sky[100], `${COLORS.sky[900]}44`) },
          ]}
        >
          <MaterialCommunityIcons name="paw" size={18} color={setLightOrDark(COLORS.sky[500], COLORS.sky[400])} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title} darkColor={COLORS.zinc[200]} lightColor={COLORS.zinc[800]}>
            Complete your pet's profile
          </Text>
          <Text style={s.subtitle} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
            Add more details to help others get to know your pet.
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={setLightOrDark(COLORS.sky[500], COLORS.sky[400])} />
      </View>
    </Pressable>
  );
};

export default MissingProfileInfoMessage;

const s = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
