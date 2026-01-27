import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, StyleSheet, Pressable } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { PostCommentDetailed } from "@/types";
import { ChainComment } from "@/types/post/post";
import { abbreviateNumber, getTimeSince } from "@/utils/utils";

import Text from "../Text/Text";

type Props = {
  comment: PostCommentDetailed | ChainComment;
  handleHeartPress: (commentId: number) => void;
  bgColor?: string;
};

const MainComment = ({ comment, handleHeartPress, bgColor }: Props) => {
  const { isDarkMode } = useColorMode();
  const timeSinceFormatted = getTimeSince(comment.created_at);

  return (
    <View style={[s.root, { backgroundColor: bgColor }]}>
      <View style={s.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 1, marginBottom: 4 }}>
          <Text style={s.username} lightColor={COLORS.zinc[900]} darkColor={COLORS.zinc[300]}>
            {comment.profile.username}
          </Text>
          <Entypo name="dot-single" size={12} color={COLORS.zinc[500]} />
          <Text style={s.timeSinceText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[600]}>
            {timeSinceFormatted}
          </Text>
        </View>
        <Text lightColor={COLORS.zinc[950]} darkColor={COLORS.zinc[300]} style={s.comment}>
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
    fontWeight: "700",
    fontSize: 13,
  },
  likeContainer: {
    marginTop: 4,
    paddingLeft: 28,
    justifyContent: "center",
  },
  comment: {
    fontSize: 14,
  },
  timeSinceText: {
    fontSize: 13,
    fontWeight: "400",
  },
  buttonContainer: {
    alignItems: "center",
  },
  likeCountText: {
    fontSize: 14,
  },
});
