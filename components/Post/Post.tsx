import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useState, useRef, useCallback, useMemo } from "react";
import { View, Pressable, Dimensions, Animated, StyleSheet } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { addLike, removeLike } from "@/api/interactions";
import { savePost as savePostApi, unSavePost as unSavePostApi } from "@/api/post";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { usePostManagerContext } from "@/context/PostManagerContext";
import { PostDetailed } from "@/types";
import { abbreviateNumber, getTimeSince } from "@/utils/utils";

import Button from "../Button/Button";
import CollapsibleText from "../CollapsibleText/CollapsibleText";
import CommentsModal from "../CommentsModal/CommentsModal";
import ImageSwiper from "../ImageSwiper/ImageSwiper";
import PostAiModal from "../PostAiModal/PostAiModal";
import ProfileImage from "../ProfileImage/ProfileImage";
import Text from "../Text/Text";

import PostMenu from "./PostMenu";
import PostTagsModal from "./PostTagsModal";

type Props = {
  post: PostDetailed;
  onProfilePress?: (profileId: number) => void;
  captionDefaultExpanded?: boolean;
  captionExpandable?: boolean;
  headerVisible?: boolean;
};

const Post = ({
  post,
  onProfilePress,
  captionDefaultExpanded = false,
  captionExpandable = true,
  headerVisible = true,
}: Props) => {
  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  const { savePost, unSavePost, onLike, onUnlike, onComment, onToggleHidden } = usePostManagerContext();
  const screenWidth = Dimensions.get("window").width;

  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [captionIsExpanded, setCaptionIsExpanded] = useState(captionDefaultExpanded);
  const [showTagPopovers, setShowTagPopovers] = useState(false);

  const scaleValue = useRef(new Animated.Value(1)).current;
  const saveButtonScaleValue = useRef(new Animated.Value(1)).current;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const postMenuRef = useRef<BottomSheetModal>(null);
  const aiMenuRef = useRef<BottomSheetModal>(null);
  const taggedProfilesModalRef = useRef<BottomSheetModal>(null);

  const handleHeartPress = useCallback(
    async (postId: number, liked: boolean) => {
      if (post.is_hidden) return;
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
        onLike(postId); // optimistic like
        const { error } = await addLike(postId, authProfile.id);
        if (error) {
          onUnlike(postId); // roll back if error
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
        onUnlike(postId); // optimistic un-like
        const { error } = await removeLike(postId);
        if (error) {
          onLike(postId); // roll back if error
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "There was an error removing that like.",
          });
        }
      }
      setLikeLoading(false);
    },
    [post.is_hidden, scaleValue, onLike, authProfile.id, onUnlike],
  );

  const addComment = () => {
    onComment && onComment(post.id);
  };

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // open the main post menu
  const openPostMenu = () => {
    postMenuRef.current?.present();
  };

  // function for post menu
  const handleProfilePress = () => {
    onProfilePress && onProfilePress(post.profile.id!);
  };

  // function for post menu
  const handleLike = () => {
    handleHeartPress(post.id, post.liked);
  };

  // function for post menu
  const handleUnlike = () => {
    handleHeartPress(post.id, post.liked);
  };

  // handle saving or un-saving the post
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
      unSavePost(post.id); // optimistic update
      const { error } = await unSavePostApi(post.id);
      if (error) {
        savePost(post); // rollback if error
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
      savePost(post); // optimistic update
      const { error } = await savePostApi(post.id, authProfile.id);
      if (error) {
        unSavePost(post.id); // rollback if error
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Error saving that post.",
        });
      } else {
        Toast.show({
          type: "savePost",
          position: "bottom",
          props: {
            imageUri: post.images[0].image,
          },
        });
      }
    }
    setSaveLoading(false);
  };

  const handleAiPress = () => {
    aiMenuRef.current?.present();
  };

  // handle tagged profile press to navigate to the profile details screen
  const handleTaggedProfilePress = (profileId: number) => {
    onProfilePress && onProfilePress(profileId);
    taggedProfilesModalRef.current?.dismiss();
  };

  // handle tags button press to show the tags modal
  const handleTagsButtonPress = useCallback(() => {
    taggedProfilesModalRef.current?.present();
  }, []);

  // toggle the tag popovers state (not the model just the tags on the post)
  const toggleTagPopovers = useCallback(() => {
    setShowTagPopovers((prev) => !prev);
  }, []);

  // define double tap gesture action to like the post
  const doubleTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .runOnJS(true)
        .onEnd(() => {
          if (post.profile.id !== authProfile.id && !likeLoading) {
            handleHeartPress(post.id, post.liked);
          }
        }),
    [post.profile.id, authProfile.id, likeLoading, post.id, post.liked, handleHeartPress],
  );

  // define single tap gesture action to show the tag popovers
  const singleTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(1)
        .maxDuration(250)
        .runOnJS(true)
        .onEnd(() => {
          toggleTagPopovers();
        }),
    [toggleTagPopovers],
  );

  // define composed gesture to handle both double tap and single tap actions
  const composedGesture = useMemo(
    () => Gesture.Exclusive(doubleTapGesture, singleTapGesture),
    [doubleTapGesture, singleTapGesture],
  );

  return (
    <View style={{ paddingBottom: 36 }}>
      {headerVisible ? (
        <View style={{ padding: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ProfileImage image={post.profile.image} size={35} />
              <Pressable
                style={({ pressed }) => [pressed && onProfilePress && { opacity: 0.7 }]}
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
              onPress={openPostMenu}
              testID={`post-menu-button-${post.id}`}
            >
              <SimpleLineIcons name="options" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[800]} />
            </Pressable>
          </View>
        </View>
      ) : null}
      <View style={{ position: "relative" }}>
        {post.is_hidden && post.profile.id !== authProfile.id ? (
          <BlurView
            intensity={90}
            style={[s.blurView, { backgroundColor: isDarkMode ? "#09090bb5" : "#d6d6dbb5" }]}
            testID={`post-${post.id}-hidden-view`}
          >
            <Ionicons name="eye-off" size={42} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700]} />
            <Text style={{ fontSize: 18, paddingHorizontal: 36, textAlign: "center", fontWeight: 300 }}>
              {(post.is_reported ? "You reported this post, " : "This post has been reported, ") +
                "so we hid it for you."}
            </Text>
            <Button
              text="Show Post"
              variant="text"
              onPress={() => onToggleHidden(post.id)}
              textStyle={{ color: COLORS.sky[600] }}
              testID={`post-${post.id}-show-post-button`}
            />
          </BlurView>
        ) : null}
        {post.is_hidden && post.profile.id === authProfile.id ? (
          <View style={s.reportedMessageContainer}>
            <View style={[s.reportedMessage, { backgroundColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[50] }]}>
              <Ionicons name="alert-circle-outline" size={14} color={isDarkMode ? COLORS.red[600] : COLORS.red[500]} />
              <Text style={{ color: isDarkMode ? COLORS.red[600] : COLORS.red[500], fontSize: 15 }}>
                This post has been reported.
              </Text>
              <Ionicons name="alert-circle-outline" size={14} color={isDarkMode ? COLORS.red[600] : COLORS.red[500]} />
            </View>
          </View>
        ) : null}
        <GestureHandlerRootView>
          <GestureDetector gesture={composedGesture}>
            <View
              style={{
                minHeight: screenWidth,
                width: screenWidth,
              }}
            >
              <ImageSwiper
                images={post.images}
                showTagPopovers={showTagPopovers}
                setShowTagPopovers={setShowTagPopovers}
                onTagsButtonPress={handleTagsButtonPress}
                aspectRatio={post.aspect_ratio}
              />
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
      </View>
      <View>
        <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 8, justifyContent: "center" }}>
          <View style={{ minWidth: 38, justifyContent: "center" }}>
            <Pressable
              onPress={() => handleHeartPress(post.id, post.liked)}
              style={({ pressed }) => [pressed && { opacity: 0.5 }]}
              disabled={post.profile.id === authProfile.id || likeLoading || post.is_hidden}
              testID={`post-like-button-${post.id}-${post.liked}`}
              hitSlop={7}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  <Ionicons
                    name={post.liked ? "heart" : "heart-outline"}
                    size={22}
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
            style={({ pressed }) => [pressed && { opacity: 0.5 }, { justifyContent: "center" }]}
            testID={`post-comment-button-${post.id}`}
            hitSlop={7}
            disabled={post.is_hidden}
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
          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto" }}>
            {post.contains_ai ? (
              <Pressable
                style={({ pressed }) => [
                  pressed && { opacity: 0.6 },
                  {
                    marginRight: post.profile.id !== authProfile.id ? 14 : 0,
                    paddingHorizontal: 4,
                  },
                ]}
                onPress={handleAiPress}
                hitSlop={10}
              >
                <Text
                  darkColor={COLORS.zinc[400]}
                  lightColor={COLORS.zinc[800]}
                  style={{ fontSize: 18, fontWeight: "600" }}
                  testID={`post-${post.id}-ai-button`}
                >
                  AI
                </Text>
              </Pressable>
            ) : null}
            {post.profile.id !== authProfile.id ? (
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, { marginRight: 2 }]}
                hitSlop={10}
                onPress={handleBookmarkPress}
                disabled={saveLoading || post.is_hidden}
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
        </View>
        <View style={{ paddingHorizontal: 8 }}>
          <CollapsibleText
            isExpanded={captionIsExpanded}
            setIsExpanded={setCaptionIsExpanded}
            caption={post.caption}
            expandable={captionExpandable}
          />
        </View>
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
        is_reported={post.is_reported}
        is_hidden={post.is_hidden}
        reports={post.reports}
      />
      <PostAiModal ref={aiMenuRef} />
      <PostTagsModal
        ref={taggedProfilesModalRef}
        taggedProfiles={post.tagged_profiles}
        onProfilePress={handleTaggedProfilePress}
      />
    </View>
  );
};

export default Post;

const s = StyleSheet.create({
  menuButton: {
    marginRight: 4,
  },
  blurView: {
    position: "absolute",
    top: 0,
    bottom: 18,
    right: 0,
    left: 0,
    backgroundColor: "red",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  reportedMessageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  reportedMessage: {
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    marginTop: 4,
    borderRadius: 10,
  },
});
