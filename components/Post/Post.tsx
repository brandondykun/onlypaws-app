import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useState, useRef, useCallback, useMemo } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";

import { addLike, removeLike } from "@/api/interactions";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { usePostManagerContext } from "@/context/PostManagerContext";
import { PostDetailed } from "@/types";
import { toast } from "@/utils/toast";

import CommentsModal from "../CommentsModal/CommentsModal";
import ImageSwiper from "../ImageSwiper/ImageSwiper";
import PostAiModal from "../PostAiModal/PostAiModal";

import AiLabel from "./components/AiLabel";
import Caption from "./components/Caption";
import CommentButton from "./components/CommentButton";
import HiddenMessage from "./components/HiddenMessage";
import LikeButton from "./components/LikeButton";
import PostHeader from "./components/PostHeader";
import PostMenu from "./components/PostMenu/PostMenu";
import SaveButton from "./components/SaveButton";
import TimeAgo from "./components/TimeAgo";
import PostTagsModal from "./PostTagsModal";

type Props = {
  post: PostDetailed;
  onProfilePress?: (profileId: number, username?: string) => void;
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
  const { authProfile } = useAuthProfileContext();
  const { onLike, onUnlike, onComment, onToggleHidden } = usePostManagerContext();

  const [likeLoading, setLikeLoading] = useState(false);
  const [showTagPopovers, setShowTagPopovers] = useState(false);

  const heartIconScaleValue = useRef(new Animated.Value(1)).current;
  const commentsModalRef = useRef<BottomSheetModal>(null);
  const postMenuRef = useRef<BottomSheetModal>(null);
  const aiMenuRef = useRef<BottomSheetModal>(null);
  const taggedProfilesModalRef = useRef<BottomSheetModal>(null);

  // function to handle the like/unlike action for the post
  const handleHeartPress = useCallback(
    async (postId: number, liked: boolean) => {
      if (post.is_hidden) return;
      setLikeLoading(true);
      if (!liked) {
        // haptic feedback
        Haptics.impactAsync();
        // animate the like button
        Animated.sequence([
          Animated.timing(heartIconScaleValue, {
            toValue: 1.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(heartIconScaleValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // optimistic like
        onLike(postId);
        // API call to like the post
        const { error } = await addLike(postId, authProfile.id);

        if (error) {
          // roll back if error
          onUnlike(postId);
          toast.error("There was an error liking that post.");
        }
      } else {
        // haptic feedback
        Haptics.selectionAsync();
        // animate the like button
        Animated.sequence([
          Animated.timing(heartIconScaleValue, {
            toValue: 0.7,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(heartIconScaleValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // optimistic un-like
        onUnlike(postId);
        // API call to un-like the post
        const { error } = await removeLike(postId);

        if (error) {
          // roll back if error
          onLike(postId);
          toast.error("There was an error removing that like.");
        }
      }
      setLikeLoading(false);
    },
    [post.is_hidden, heartIconScaleValue, onLike, authProfile.id, onUnlike],
  );

  // function to add a comment to the post from the comments modal
  const addComment = () => {
    onComment && onComment(post.id);
  };

  // handle pressing the comment button to show the comments modal
  const handleCommentButtonPress = useCallback(() => {
    commentsModalRef.current?.present();
  }, []);

  // open the main post menu
  const openPostMenu = () => {
    postMenuRef.current?.present();
  };

  // function for post menu
  const handleProfilePress = () => {
    onProfilePress && onProfilePress(post.profile.id!, post.profile.username ?? undefined);
  };

  // function for post menu
  const handleLike = () => {
    handleHeartPress(post.id, post.liked);
  };

  // function for post menu
  const handleUnlike = () => {
    handleHeartPress(post.id, post.liked);
  };

  // handle pressing the ai label to show to ai info modal (PostAiModal)
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
    <View style={s.root}>
      {/* Post header component to show the profile image, username, and post menu button */}
      <PostHeader
        visible={headerVisible}
        profileImage={post.profile.image}
        username={post.profile.username}
        hasPressAction={onProfilePress !== undefined}
        postId={post.id}
        handleProfilePress={handleProfilePress}
        openPostMenu={openPostMenu}
      />
      <View style={s.imagesContainer}>
        {/* Hidden message component to show when the post is hidden */}
        <HiddenMessage
          isHidden={post.is_hidden}
          profileId={post.profile.id!}
          postId={post.id}
          isReported={post.is_reported}
          onToggleHidden={onToggleHidden}
        />
        {/* Image swiper component to show the images in the post */}
        <GestureHandlerRootView>
          <GestureDetector gesture={composedGesture}>
            <ImageSwiper
              images={post.images}
              showTagPopovers={showTagPopovers}
              setShowTagPopovers={setShowTagPopovers}
              onTagsButtonPress={handleTagsButtonPress}
              aspectRatio={post.aspect_ratio}
            />
          </GestureDetector>
        </GestureHandlerRootView>
      </View>
      <View style={s.postFooterContainer}>
        <View style={s.interactionButtons}>
          {/* Like button */}
          <LikeButton
            handleHeartPress={handleHeartPress}
            postId={post.id}
            isLiked={post.liked}
            likesCount={post.likes_count}
            profileId={post.profile.id!}
            likeLoading={likeLoading}
            isHidden={post.is_hidden}
            scaleValue={heartIconScaleValue}
          />
          {/* Comment button */}
          <CommentButton
            onPress={handleCommentButtonPress}
            postId={post.id}
            isHidden={post.is_hidden}
            commentsCount={post.comments_count}
          />
          <View style={s.rightAlignedInteractionButtons}>
            {/* Ai label button */}
            <AiLabel
              visible={post.contains_ai}
              handleAiPress={handleAiPress}
              postProfileId={post.profile.id}
              postId={post.id}
            />
            {/* Save post button */}
            <SaveButton post={post} />
          </View>
        </View>
        {/* Caption component to show the caption of the post */}
        <Caption
          caption={post.caption}
          captionExpandable={captionExpandable}
          postId={post.id}
          defaultExpanded={captionDefaultExpanded}
        />
        {/* Time ago component to show the time since the post was created */}
        <TimeAgo createdAt={post.created_at} />
      </View>
      {/* Comments modal to show the comments of the post */}
      <CommentsModal postId={post.id} addCommentToPost={addComment} ref={commentsModalRef} />
      {/* Post menu to show the menu of the post */}
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
      {/* Post ai modal to show the ai menu of the post */}
      <PostAiModal ref={aiMenuRef} />
      {/* Post tags modal to show the tags of the post */}
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
  root: {
    paddingBottom: 36,
  },
  imagesContainer: {
    position: "relative",
  },
  interactionButtons: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  rightAlignedInteractionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  postFooterContainer: {
    marginHorizontal: 8,
  },
});
