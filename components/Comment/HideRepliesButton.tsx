import { Pressable, View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  onPress: () => void;
};

const HideRepliesButton = ({ onPress }: Props) => {
  const { isDarkMode } = useColorMode();
  return (
    <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={onPress} hitSlop={8}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 24, height: 1, backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300] }} />
        <Text lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]} style={s.buttonText}>
          hide replies
        </Text>
      </View>
    </Pressable>
  );
};

export default HideRepliesButton;

const s = StyleSheet.create({
  buttonText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    marginHorizontal: 12,
  },
});
