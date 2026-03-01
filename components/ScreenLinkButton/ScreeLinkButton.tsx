import { Entypo } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

const ScreenLinkButton = ({ title, onPress, icon }: { title: string; onPress: () => void; icon: React.ReactNode }) => {
  const { setLightOrDark } = useColorMode();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.main, pressed && { opacity: 0.6 }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={s.icon}>{icon}</View>
        <Text style={s.title}>{title}</Text>
      </View>
      <Entypo name="chevron-small-right" size={24} color={setLightOrDark(COLORS.zinc[900], COLORS.zinc[400])} />
    </Pressable>
  );
};

export default ScreenLinkButton;

const s = StyleSheet.create({
  main: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: 25,
    alignItems: "center",
    marginRight: 10,
  },
  title: {
    fontSize: 18,
  },
});
