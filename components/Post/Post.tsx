import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { View, Pressable, Dimensions } from "react-native";
import { GestureHandlerRootView, TapGestureHandler } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { addLike, removeLike } from "@/api/post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { PostCommentDetailed, PostDetailed } from "@/types";
import { PostLike } from "@/types";
import { getTimeSince } from "@/utils/utils";

import CommentsModal from "../CommentsModal/CommentsModal";
import ImageSwiper from "../ImageSwiper/ImageSwiper";
import ProfileImage from "../ProfileImage/ProfileImage";
import Text from "../Text/Text";

import PostCaption from "./PostCaption";

export const POST_HEIGHT = Dimensions.get("window").width + 200;

type Props = {
  post: PostDetailed;
  setPosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  onProfilePress: (profileId: number) => void;
  onLike?: (newPostLike: PostLike) => void;
  onUnlike?: (postId: number) => void;
  onComment?: (comment: PostCommentDetailed, postId: number) => void;
};

const Post = ({ post, setPosts, onProfilePress, onLike, onUnlike, onComment }: Props) => {
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  const screenWidth = Dimensions.get("window").width;

  const likedIds = post.likes.map((like) => {
    return like.profile;
  });

  const liked = likedIds.includes(authProfile.id!);

  const handleHeartPress = async (postId: number, liked: boolean) => {
    setLikeLoading(true);
    if (!liked) {
      const { error, data } = await addLike(postId, authProfile.id);
      if (data && !error) {
        onLike && onLike(data);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error liking that post.",
        });
      }
    } else {
      const { error } = await removeLike(postId, authProfile.id);
      if (!error) {
        onUnlike && onUnlike(postId);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error removing that like.",
        });
      }
    }
    setLikeLoading(false);
  };

  const addComment = (comment: PostCommentDetailed) => {
    onComment && onComment(comment, post.id);
  };

  return (
    <View key={post.id} style={{ minHeight: POST_HEIGHT }}>
      <View style={{ padding: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <ProfileImage image={post.profile.image} size={35} />
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            onPress={() => onProfilePress(post.profile.id!)}
          >
            <Text darkColor={COLORS.zinc[300]} style={{ fontSize: 20, textDecorationLine: "underline" }}>
              {post.profile.username}
            </Text>
          </Pressable>
        </View>
      </View>
      <View>
        <GestureHandlerRootView>
          <TapGestureHandler
            numberOfTaps={2}
            onActivated={
              post.profile.id === authProfile.id || likeLoading ? undefined : () => handleHeartPress(post.id, liked)
            }
          >
            <View
              style={{
                minHeight: screenWidth,
                width: screenWidth,
              }}
            >
              <ImageSwiper
                images={post.images}
                imageHeight={screenWidth}
                imageWidth={screenWidth}
                imageStyle={{ height: screenWidth, width: screenWidth }}
              />
            </View>
          </TapGestureHandler>
        </GestureHandlerRootView>
      </View>

      <View>
        <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 8 }}>
          <Pressable
            onPress={() => handleHeartPress(post.id, liked)}
            style={({ pressed }) => [pressed && { opacity: 0.5 }]}
            disabled={post.profile.id === authProfile.id || likeLoading}
            testID="post-like-button"
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <AntDesign
                name={liked ? "heart" : "hearto"}
                size={20}
                color={liked ? COLORS.red[600] : isDarkMode ? COLORS.zinc[400] : COLORS.zinc[900]}
              />
              <Text style={{ fontSize: 18 }}>{post.likes.length}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setCommentsModalVisible(true)}
            style={({ pressed }) => [pressed && { opacity: 0.5 }]}
            testID="post-comment-button"
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <FontAwesome name="comment-o" size={20} color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[900]} />
              <Text style={{ fontSize: 18 }}>{post.comments_count}</Text>
            </View>
          </Pressable>
        </View>
        <PostCaption caption={post.caption} />
        <View style={{ paddingLeft: 8, paddingTop: 6 }}>
          <Text darkColor={COLORS.zinc[500]} style={{ fontSize: 13 }}>
            {getTimeSince(post.created_at)}
          </Text>
        </View>
      </View>
      <CommentsModal
        visible={commentsModalVisible}
        onRequestClose={() => setCommentsModalVisible(false)}
        postId={post.id}
        addCommentToPost={addComment}
      />
    </View>
  );
};

export default Post;
