import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, StyleSheet, Pressable } from "react-native";

import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { abbreviateNumber } from "@/utils/utils";

type Props = {
  handleHeartPress: (postId: number, liked: boolean) => Promise<void>;
  postId: number;
  isLiked: boolean;
  likesCount: number;
  profileId: string;
  likeLoading: boolean;
  isHidden: boolean;
  scaleValue: Animated.Value;
};

const LikeButton = ({
  handleHeartPress,
  postId,
  isLiked,
  likesCount,
  profileId,
  likeLoading,
  isHidden,
  scaleValue,
}: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  return (
    <Pressable
      onPress={() => handleHeartPress(postId, isLiked)}
      style={({ pressed }) => [pressed && { opacity: 0.5 }, s.root]}
      disabled={profileId === authProfile.public_id || likeLoading || isHidden}
      testID={`post-like-button-${postId}-${isLiked}`}
      hitSlop={7}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={22}
          color={isLiked ? COLORS.red[600] : isDarkMode ? COLORS.zinc[400] : COLORS.zinc[900]}
        />
      </Animated.View>
      <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[900]} style={s.countText}>
        {abbreviateNumber(likesCount)}
      </Text>
    </Pressable>
  );
};

export default LikeButton;

const s = StyleSheet.create({
  root: {
    minWidth: 45,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  countText: {
    fontSize: 16,
    fontWeight: "400",
  },
});
