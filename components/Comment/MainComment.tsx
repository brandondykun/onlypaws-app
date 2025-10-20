import Ionicons from "@expo/vector-icons/Ionicons";
import { View, StyleSheet, Pressable } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { PostCommentDetailed } from "@/types";
import { ChainComment } from "@/types/post/post";
import { abbreviateNumber } from "@/utils/utils";

import Text from "../Text/Text";

type Props = {
  comment: PostCommentDetailed | ChainComment;
  handleHeartPress: (commentId: number) => void;
  bgColor?: string;
};

const MainComment = ({ comment, handleHeartPress, bgColor }: Props) => {
  const { isDarkMode } = useColorMode();
  return (
    <View style={[s.root, { backgroundColor: bgColor }]}>
      <View style={s.header}>
        <Text style={s.username} lightColor={COLORS.zinc[600]} darkColor={COLORS.zinc[500]}>
          {comment.profile.username}
        </Text>
        <Text lightColor={COLORS.zinc[950]} style={s.comment}>
          {comment.text}
        </Text>
      </View>
      <View style={s.likeContainer}>
        <Pressable
          hitSlop={10}
          onPress={() => handleHeartPress(comment.id)}
          testID={`comment-like-button-${comment.id}-${comment.liked}`}
        >
          <View style={s.buttonContainer}>
            <Ionicons
              name={comment.liked ? "heart" : "heart-outline"}
              size={15}
              color={comment.liked ? COLORS.red[600] : isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600]}
            />
            <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.likeCountText}>
              {comment.likes_count ? abbreviateNumber(comment.likes_count) : ""}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default MainComment;

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    padding: 12,
    paddingVertical: 6,
  },
  header: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
    marginBottom: 3,
    fontSize: 12,
  },
  likeContainer: {
    marginTop: 4,
    paddingLeft: 28,
    justifyContent: "center",
  },
  comment: {
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: "center",
  },
  likeCountText: {
    fontSize: 14,
  },
});
