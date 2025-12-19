import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { abbreviateNumber } from "@/utils/utils";

type Props = {
  onPress: () => void;
  postId: number;
  isHidden: boolean;
  commentsCount: number;
};

const CommentButton = ({ onPress, postId, isHidden, commentsCount }: Props) => {
  const { isDarkMode } = useColorMode();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && s.pressed, s.root]}
      testID={`post-comment-button-${postId}`}
      hitSlop={7}
      disabled={isHidden}
    >
      <FontAwesome name="comment-o" size={20} color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[900]} style={s.icon} />
      <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[900]} style={s.countText}>
        {abbreviateNumber(commentsCount)}
      </Text>
    </Pressable>
  );
};

export default CommentButton;

const s = StyleSheet.create({
  root: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pressed: {
    opacity: 0.5,
  },
  icon: {
    marginTop: -1,
  },
  countText: {
    fontSize: 16,
    fontWeight: "400",
  },
});
