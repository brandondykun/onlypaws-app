import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useState, useRef, useCallback } from "react";
import { View, Pressable, Dimensions, Animated, StyleSheet } from "react-native";
import { GestureHandlerRootView, TapGestureHandler } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { addLike, removeLike, savePost as savePostApi, unSavePost as unSavePostApi } from "@/api/post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostManagerContext } from "@/context/PostManagerContext";
import { useSavedPostsContext } from "@/context/SavedPostsContext";
import { PostDetailed } from "@/types";
import { abbreviateNumber, getTimeSince } from "@/utils/utils";

import CommentsModal from "../CommentsModal/CommentsModal";
import ImageSwiper from "../ImageSwiper/ImageSwiper";
import ProfileImage from "../ProfileImage/ProfileImage";
import Text from "../Text/Text";

import PostCaption from "./PostCaption";
import PostMenu from "./PostMenu";

export const POST_HEIGHT = Dimensions.get("window").width + 200;

type Props = {
  post: PostDetailed;
  onProfilePress: (profileId: number) => void;
};

const Post = ({ post, onProfilePress }: Props) => {
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  const screenWidth = Dimensions.get("window").width;
  const savedPosts = useSavedPostsContext();
  const { savePost, unSavePost, onLike, onUnlike, onComment } = usePostManagerContext();

  const scaleValue = useRef(new Animated.Value(1)).current;
  const saveButtonScaleValue = useRef(new Animated.Value(1)).current;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const postMenuRef = useRef<BottomSheetModal>(null);

  const handleHeartPress = async (postId: number, liked: boolean) => {
    setLikeLoading(true);
    if (!liked) {
      Haptics.impactAsync();
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      onLike && onLike(postId);
      const { error } = await addLike(postId, authProfile.id);
      if (error) {
        onUnlike && onUnlike(postId);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error liking that post.",
        });
      }
    } else {
      Haptics.selectionAsync();
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      onUnlike && onUnlike(postId);
      const { error } = await removeLike(postId, authProfile.id);
      if (error) {
        onLike && onLike(postId);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error removing that like.",
        });
      }
    }
    setLikeLoading(false);
  };

  const addComment = () => {
    onComment && onComment(post.id);
  };

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // function for post menu
  const openMenu = () => {
    postMenuRef.current?.present();
  };

  // function for post menu
  const handleProfilePress = () => {
    onProfilePress(post.profile.id!);
  };

  // function for post menu
  const handleLike = () => {
    handleHeartPress(post.id, post.liked);
  };

  // function for post menu
  const handleUnlike = () => {
    handleHeartPress(post.id, post.liked);
  };

  const handleUnSavePost = () => {
    unSavePost(post.id);
  };

  const handleSavePost = () => {
    savePost(post);
  };

  const handleBookmarkPress = async () => {
    setSaveLoading(true);
    if (post.is_saved) {
      Haptics.selectionAsync();
      Animated.sequence([
        Animated.timing(saveButtonScaleValue, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(saveButtonScaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      handleUnSavePost();
      const { error } = await unSavePostApi(post.id);
      if (!error) {
        savedPosts.unSavePost(post.id);
      } else {
        handleSavePost();
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Error un-saving that post.",
        });
      }
    } else {
      Haptics.impactAsync();
      Animated.sequence([
        Animated.timing(saveButtonScaleValue, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(saveButtonScaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      handleSavePost();
      const { error } = await savePostApi(post.id, authProfile.id);
      if (!error) {
        savedPosts.savePost({ ...post, is_saved: true });
      } else {
        handleUnSavePost();
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Error saving that post.",
        });
      }
    }
    setSaveLoading(false);
  };

  return (
    <View key={post.id} style={{ minHeight: POST_HEIGHT }}>
      <View style={{ padding: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <ProfileImage image={post.profile.image} size={35} />
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              onPress={handleProfilePress}
              hitSlop={10}
              testID={`post-username-button-${post.id}`}
            >
              <Text darkColor={COLORS.zinc[300]} style={{ fontSize: 20, textDecorationLine: "underline" }}>
                {post.profile.username}
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.6 }, s.menuButton]}
            hitSlop={8}
            onPress={openMenu}
            testID={`post-menu-button-${post.id}`}
          >
            <SimpleLineIcons name="options" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]} />
          </Pressable>
        </View>
      </View>
      <View>
        <GestureHandlerRootView>
          <TapGestureHandler
            numberOfTaps={2}
            onActivated={
              post.profile.id === authProfile.id || likeLoading
                ? undefined
                : () => handleHeartPress(post.id, post.liked)
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
          <View style={{ minWidth: 35 }}>
            <Pressable
              onPress={() => handleHeartPress(post.id, post.liked)}
              style={({ pressed }) => [pressed && { opacity: 0.5 }]}
              disabled={post.profile.id === authProfile.id || likeLoading}
              testID={`post-like-button-${post.id}`}
              hitSlop={7}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  <AntDesign
                    name={post.liked ? "heart" : "hearto"}
                    size={20}
                    color={post.liked ? COLORS.red[600] : isDarkMode ? COLORS.zinc[400] : COLORS.zinc[900]}
                  />
                </Animated.View>
                <Text
                  darkColor={COLORS.zinc[300]}
                  lightColor={COLORS.zinc[900]}
                  style={{ fontSize: 16, fontWeight: "400" }}
                >
                  {abbreviateNumber(post.likes_count)}
                </Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            onPress={handlePresentModalPress}
            style={({ pressed }) => [pressed && { opacity: 0.5 }]}
            testID={`post-comment-button-${post.id}`}
            hitSlop={7}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <FontAwesome
                name="comment-o"
                size={20}
                color={isDarkMode ? COLORS.zinc[400] : COLORS.zinc[900]}
                style={{ marginTop: -1 }}
              />
              <Text
                darkColor={COLORS.zinc[300]}
                lightColor={COLORS.zinc[900]}
                style={{ fontSize: 16, fontWeight: "400" }}
              >
                {abbreviateNumber(post.comments_count)}
              </Text>
            </View>
          </Pressable>
          {post.profile.id !== authProfile.id ? (
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, { marginLeft: "auto", marginRight: 2 }]}
              hitSlop={10}
              onPress={handleBookmarkPress}
              disabled={saveLoading}
              testID={`post-save-button-${post.id}`}
            >
              <Animated.View style={{ transform: [{ scale: saveButtonScaleValue }] }}>
                <FontAwesome
                  name={!post.is_saved ? "bookmark-o" : "bookmark"}
                  size={20}
                  color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]}
                />
              </Animated.View>
            </Pressable>
          ) : null}
        </View>
        <PostCaption caption={post.caption} />
        <View style={{ paddingLeft: 8, paddingTop: 6 }}>
          <Text darkColor={COLORS.zinc[500]} style={{ fontSize: 13 }}>
            {getTimeSince(post.created_at)}
          </Text>
        </View>
      </View>
      <CommentsModal postId={post.id} addCommentToPost={addComment} ref={bottomSheetModalRef} />
      <PostMenu
        ref={postMenuRef}
        onViewProfilePress={handleProfilePress}
        onLike={handleLike}
        onUnlike={handleUnlike}
        liked={post.liked}
        postProfileId={post.profile.id}
        postId={post.id}
      />
    </View>
  );
};

export default Post;

const s = StyleSheet.create({
  menuButton: {
    marginRight: 4,
  },
});
