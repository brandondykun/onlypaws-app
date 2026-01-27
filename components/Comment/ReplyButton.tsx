import { Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";

import Text from "../Text/Text";

type Props = {
  onReplyPress: () => void;
};

const ReplyButton = ({ onReplyPress }: Props) => {
  return (
    <Pressable style={({ pressed }) => [s.replyButton, pressed && { opacity: 0.6 }]} onPress={onReplyPress} hitSlop={8}>
      <Text lightColor={COLORS.zinc[800]} darkColor={COLORS.zinc[400]} style={s.replyButtonText}>
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
    marginTop: 0,
    paddingLeft: 0,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.9,
  },
});
