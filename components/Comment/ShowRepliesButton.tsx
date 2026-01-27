import { Pressable, View, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  onPress: () => void;
  commentRepliesCount: number;
  commentRepliesLength: number;
};

const ShowRepliesButton = ({ onPress, commentRepliesCount, commentRepliesLength }: Props) => {
  const { isDarkMode } = useColorMode();

  return (
    <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 24, height: 1, backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[400] }} />
        <Text lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]} style={s.buttonText}>
          View {commentRepliesCount - commentRepliesLength} {commentRepliesLength ? "more " : ""}
          {commentRepliesCount - commentRepliesLength === 1 ? "reply" : "replies"}
        </Text>
      </View>
    </Pressable>
  );
};

export default ShowRepliesButton;

const s = StyleSheet.create({
  buttonText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    marginHorizontal: 12,
  },
});
