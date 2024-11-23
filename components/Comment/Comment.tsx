import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import { deleteCommentLike, likeComment } from "@/api/post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { PostCommentDetailed } from "@/types";
import { abbreviateNumber } from "@/utils/utils";

import Text from "../Text/Text";

type Props = {
  comment: PostCommentDetailed;
  onLike: (commentId: number) => void;
  onUnlike: (commentId: number) => void;
};

const Comment = ({ comment, onLike, onUnlike }: Props) => {
  const { isDarkMode } = useColorMode();

  const { authProfile } = useAuthProfileContext();

  const handleLike = async (commentId: number) => {
    Haptics.impactAsync();
    onLike(commentId); // optimistic like
    const { error } = await likeComment(commentId, authProfile.id);
    if (error) {
      onUnlike(commentId); // revert like on error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error liking that comment.",
      });
    }
  };

  const handleUnlike = async (commentId: number) => {
    Haptics.selectionAsync();
    onUnlike(commentId); // optimistic unlike
    const { error } = await deleteCommentLike(commentId, authProfile.id);
    if (error) {
      onLike(commentId); // revert unlike on error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error removing that like.",
      });
    }
  };

  const handleHeartPress = (commentId: number) => {
    if (comment.liked) {
      handleUnlike(commentId);
    } else {
      handleLike(commentId);
    }
  };

  return (
    <View key={comment.id} style={s.root}>
      <View style={s.header}>
        <Text darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[500]} style={s.username}>
          {comment.profile.username}
        </Text>
        <Text style={s.comment}>{comment.text}</Text>
      </View>
      <View style={s.likeContainer}>
        <Pressable hitSlop={10} onPress={() => handleHeartPress(comment.id)}>
          <View style={s.buttonContainer}>
            <AntDesign
              name={comment.liked ? "heart" : "hearto"}
              size={16}
              color={comment.liked ? COLORS.red[600] : isDarkMode ? COLORS.zinc[400] : COLORS.zinc[900]}
            />
            <Text darkColor={COLORS.zinc[400]} style={s.likeCountText}>
              {comment.likes_count ? abbreviateNumber(comment.likes_count) : ""}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default Comment;

const s = StyleSheet.create({
  root: {
    padding: 12,
    flexDirection: "row",
    minHeight: 62,
  },
  header: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 11,
  },
  likeContainer: {
    marginTop: 4,
    paddingLeft: 28,
    justifyContent: "center",
  },
  comment: {
    fontSize: 15,
  },
  buttonContainer: {
    alignItems: "center",
    gap: 2,
  },
  likeCountText: {
    fontSize: 14,
  },
});
