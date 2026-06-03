import { Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import Text from "@/shared/ui/Text/Text";

type Props = {
  visible: boolean;
  handleAiPress: () => void;
  postProfileId: number | null;
  postId: number;
};

const AiLabel = ({ visible, handleAiPress, postProfileId, postId }: Props) => {
  if (!visible || !postProfileId) return null;

  return (
    <Pressable style={({ pressed }) => [pressed && s.pressed]} onPress={handleAiPress} hitSlop={10}>
      <Text
        darkColor={COLORS.zinc[400]}
        lightColor={COLORS.zinc[800]}
        style={s.text}
        testID={`post-${postId}-ai-button`}
      >
        AI
      </Text>
    </Pressable>
  );
};

export default AiLabel;

const s = StyleSheet.create({
  pressed: {
    opacity: 0.6,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
  },
});
