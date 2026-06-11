import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { memo, useState, useRef, useCallback, useMemo, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";

import { addLike, removeLike, addPostInteraction } from "@/api/interactions";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { usePostManagerContext } from "@/context/PostManagerContext";
import useDogVisionIndicator from "@/hooks/useDogVisionIndicator";
import { PostDetailed } from "@/types";
import { toast } from "@/utils/toast";

import CommentsModal from "../CommentsModal/CommentsModal";
import ImageSwiper from "../ImageSwiper/ImageSwiper";
import PostAiModal from "../PostAiModal/PostAiModal";

import AiLabel from "./components/AiLabel";
import Caption from "./components/Caption";
import CommentButton from "./components/CommentButton";
import DogVisionButton from "./components/DogVisionButton";
import DogVisionPill from "./components/DogVisionPill";
import HiddenMessage from "./components/HiddenMessage";
import LikeButton from "./components/LikeButton";
import PostHeader from "./components/PostHeader";
import PostMenu from "./components/PostMenu/PostMenu";
import SaveButton from "./components/SaveButton";
import TimeAgo from "./components/TimeAgo";
import PostTagsModal from "./PostTagsModal";

type Props = {
  post: PostDetailed;
  onProfilePress?: (profileId: string, username?: string) => void;
  captionDefaultExpanded?: boolean;
  captionExpandable?: boolean;
  headerVisible?: boolean;
};

type DogVisionState = {
  postId: number;
  active: boolean;
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [dogVisionState, setDogVisionState] = useState<DogVisionState>({ postId: post.id, active: false });
  const [dogVisionReadyPostId, setDogVisionReadyPostId] = useState<number | null>(null);

  const heartIconScaleValue = useRef(new Animated.Value(1)).current;
  const commentsModalRef = useRef<BottomSheetModal>(null);
  const postMenuRef = useRef<BottomSheetModal>(null);
  const aiMenuRef = useRef<BottomSheetModal>(null);
  const taggedProfilesModalRef = useRef<BottomSheetModal>(null);

  // Feed cells can be recycled for a different post. Keying the state by post id prevents stale Dog Vision state
  // from briefly showing on the next post before React effects have a chance to reset local state.
  const currentPostDogVisionActive = dogVisionState.postId === post.id ? dogVisionState.active : false;
  const currentPostDogVisionReady = dogVisionReadyPostId === post.id;
  const showCurrentPostDogVisionIndicator = currentPostDogVisionActive && currentPostDogVisionReady;
  const {
    animation: dogVisionIndicatorAnimation,
    resetEntrance: resetDogVisionIndicatorEntrance,
    visible: showDogVisionIndicator,
  } = useDogVisionIndicator(showCurrentPostDogVisionIndicator);

  useEffect(() => {
    setActiveImageIndex(0);
    setDogVisionReadyPostId(null);
  }, [post.id]);

  // function to handle the like/unlike action for the post
  const handleHeartPress = useCallback(
    async (postId: number, liked: boolean) => {
      if (post.is_hidden) return;
      setLikeLoading(true);
      if (!liked) {
        // Fire-and-forget: record like interaction for preference embedding.
        addPostInteraction(postId, "like").catch(() => {});
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
  const addComment = useCallback(() => {
    onComment && onComment(post.id);
  }, [onComment, post.id]);

  // handle pressing the comment button to show the comments modal
  const handleCommentButtonPress = useCallback(() => {
    commentsModalRef.current?.present();
  }, []);

  // open the main post menu
  const openPostMenu = useCallback(() => {
    postMenuRef.current?.present();
  }, []);

  // function for post menu
  const handleProfilePress = useCallback(() => {
    onProfilePress && onProfilePress(post.profile.public_id!, post.profile.username ?? undefined);
  }, [onProfilePress, post.profile.public_id, post.profile.username]);

  // function for post menu
  const handleLike = useCallback(() => {
    handleHeartPress(post.id, post.liked);
  }, [handleHeartPress, post.id, post.liked]);

  // function for post menu
  const handleUnlike = useCallback(() => {
    handleHeartPress(post.id, post.liked);
  }, [handleHeartPress, post.id, post.liked]);

  // handle pressing the ai label to show to ai info modal (PostAiModal)
  const handleAiPress = useCallback(() => {
    aiMenuRef.current?.present();
  }, []);

  // handle tagged profile press to navigate to the profile details screen
  const handleTaggedProfilePress = useCallback(
    (profileId: string) => {
      onProfilePress && onProfilePress(profileId);
      taggedProfilesModalRef.current?.dismiss();
    },
    [onProfilePress],
  );

  // handle tags button press to show the tags modal
  const handleTagsButtonPress = useCallback(() => {
    taggedProfilesModalRef.current?.present();
  }, []);

  const handleDogVisionReady = useCallback(
    (imageIndex: number) => {
      if (imageIndex !== activeImageIndex) return;
      setDogVisionReadyPostId((currentPostId) => (currentPostId === post.id ? currentPostId : post.id));
    },
    [activeImageIndex, post.id],
  );

  const handleDogVisionToggle = useCallback(
    (active?: boolean) => {
      const nextDogVisionActive = active ?? !currentPostDogVisionActive;
      if (nextDogVisionActive === currentPostDogVisionActive) return;

      // Long-press image toggles already provide haptics and the explicit next state. Button/menu toggles do not.
      if (active === undefined) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (nextDogVisionActive) {
        resetDogVisionIndicatorEntrance();
      }

      setDogVisionReadyPostId(null);
      setDogVisionState({ postId: post.id, active: nextDogVisionActive });
    },
    [currentPostDogVisionActive, post.id, resetDogVisionIndicatorEntrance],
  );

  const handleDogVisionButtonPress = useCallback(() => {
    handleDogVisionToggle();
  }, [handleDogVisionToggle]);

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
          if (!likeLoading) {
            handleHeartPress(post.id, post.liked);
          }
        }),
    [likeLoading, post.id, post.liked, handleHeartPress],
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
          profileId={post.profile.public_id}
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
              onIndexChange={setActiveImageIndex}
              aspectRatio={post.aspect_ratio}
              dogVision={currentPostDogVisionActive}
              onDogVisionReady={handleDogVisionReady}
              onDogVisionToggle={handleDogVisionToggle}
            />
          </GestureDetector>
        </GestureHandlerRootView>
        <DogVisionPill
          visible={showDogVisionIndicator && dogVisionState.postId === post.id}
          animation={dogVisionIndicatorAnimation}
        />
      </View>
      <View style={s.postFooterContainer}>
        <View style={s.interactionButtons}>
          {/* Like button */}
          <LikeButton
            handleHeartPress={handleHeartPress}
            postId={post.id}
            isLiked={post.liked}
            likesCount={post.likes_count}
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
            <DogVisionButton
              active={currentPostDogVisionActive}
              disabled={post.is_hidden}
              onPress={handleDogVisionButtonPress}
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
      <CommentsModal
        postId={post.id}
        postProfileId={post.profile.id}
        addCommentToPost={addComment}
        ref={commentsModalRef}
      />
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
        dogVisionActive={currentPostDogVisionActive}
        onDogVisionToggle={handleDogVisionToggle}
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

export default memo(Post);

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
    gap: 18,
    marginLeft: "auto",
  },
  postFooterContainer: {
    marginHorizontal: 8,
  },
});
