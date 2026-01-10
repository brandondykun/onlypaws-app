import { Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";

import Text from "../Text/Text";

type Props = {
  onReplyPress: () => void;
};

const ReplyButton = ({ onReplyPress }: Props) => {
  const { isDarkMode } = useColorMode();
  return (
    <Pressable
      style={({ pressed }) => [
        s.replyButton,
        pressed && { opacity: 0.6 },
        {
          backgroundColor: isDarkMode ? COLORS.zinc[800] : `${COLORS.zinc[100]}80`,
        },
      ]}
      onPress={onReplyPress}
      hitSlop={8}
    >
      <Text lightColor={COLORS.zinc[700]} darkColor={COLORS.zinc[400]} style={s.replyButtonText}>
        Reply
      </Text>
    </Pressable>
  );
};

export default ReplyButton;

const s = StyleSheet.create({
  replyButton: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
});
