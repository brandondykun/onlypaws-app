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
  replyComment: PostCommentDetailed | ChainComment;
  handleLikeReply: (commentId: number) => void;
  handleUnlikeReply: (commentId: number) => void;
  bgColor?: string;
};

const ReplyComment = ({ replyComment, handleLikeReply, handleUnlikeReply, bgColor }: Props) => {
  const { isDarkMode } = useColorMode();
  const timeSinceFormatted = getTimeSince(replyComment.created_at);

  return (
    <View style={[s.root, { backgroundColor: bgColor }]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 1, marginBottom: 4 }}>
          <Text style={s.username} lightColor={COLORS.zinc[900]} darkColor={COLORS.zinc[300]}>
            {replyComment.profile.username}
          </Text>
          <Entypo name="dot-single" size={12} color={COLORS.zinc[500]} />
          <Text style={s.timeSinceText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[600]}>
            {timeSinceFormatted}
          </Text>
        </View>
        <View style={{ marginBottom: 6 }}>
          <Text style={s.comment}>
            <Text darkColor={COLORS.sky[400]} lightColor={COLORS.sky[600]}>
              @{`${replyComment.reply_to_comment_username} `}
            </Text>
            <Text lightColor={COLORS.zinc[950]} darkColor={COLORS.zinc[300]} style={s.comment}>
              {replyComment.text}
            </Text>
          </Text>
        </View>
      </View>
      <View style={[s.likeContainer, { paddingRight: 12 }]}>
        <Pressable
          hitSlop={10}
          onPress={() => {
            if (replyComment.liked) {
              handleUnlikeReply(replyComment.id);
            } else {
              handleLikeReply(replyComment.id);
            }
          }}
          testID={`comment-reply-button-${replyComment.id}-false`}
        >
          <View style={s.buttonContainer}>
            <Ionicons
              name={replyComment.liked ? "heart" : "heart-outline"}
              size={15}
              color={replyComment.liked ? COLORS.red[600] : isDarkMode ? COLORS.zinc[400] : COLORS.zinc[600]}
            />
            <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]} style={s.likeCountText}>
              {replyComment.likes_count ? abbreviateNumber(replyComment.likes_count) : ""}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default ReplyComment;

const s = StyleSheet.create({
  root: {
    paddingLeft: 28,
    flexDirection: "row",
    paddingTop: 6,
    paddingBottom: 2,
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
