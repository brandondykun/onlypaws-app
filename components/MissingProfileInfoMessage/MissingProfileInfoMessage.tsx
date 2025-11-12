import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const MissingProfileInfoMessage = () => {
  const { setLightOrDark } = useColorMode();
  const router = useRouter();

  const handlePress = () => {
    router.push("/(app)/profile/editProfile");
  };

  return (
    <Pressable
      style={({ pressed }) => [
        pressed && { opacity: 0.7 },
        {
          marginTop: 12,
          backgroundColor: setLightOrDark(COLORS.sky[100], COLORS.sky[975]),
          padding: 12,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        },
      ]}
      onPress={handlePress}
    >
      <View>
        <Ionicons name="information-circle" size={32} color={COLORS.sky[500]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.missingInfoText} darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]}>
          Your profile is missing some information. <Text style={{ textDecorationLine: "underline" }}>Press here</Text>{" "}
          to add it so your friends can know more about you.
        </Text>
      </View>
    </Pressable>
  );
};

export default MissingProfileInfoMessage;

const s = StyleSheet.create({
  missingInfoText: {
    fontSize: 16,
    textAlign: "left",
    fontWeight: "400",
    flex: 1,
    fontStyle: "italic",
  },
});
