import { useLocalSearchParams, useRouter } from "expo-router";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useFeedPostsContext } from "@/context/FeedPostsContext";
import { useProfileDetailsContext } from "@/context/ProfileDetailsContext";
import { PostLike, PostCommentDetailed } from "@/types";
import { addCommentInState, likePostInState, unlikePostInState } from "@/utils/utils";

const FeedProfilePostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { posts } = useProfileDetailsContext();
  const feed = useFeedPostsContext();
  const { authProfile } = useAuthProfileContext();

  const router = useRouter();

  const onProfilePress = (profileId: number) => {
    router.back();
  };

  const onLike = (newPostLike: PostLike) => {
    likePostInState(posts.setData, newPostLike);
    likePostInState(feed.setData, newPostLike);
  };

  const onUnlike = (postId: number) => {
    unlikePostInState(posts.setData, postId, authProfile.id!);
    unlikePostInState(feed.setData, postId, authProfile.id!);
  };

  const onComment = (comment: PostCommentDetailed, postId: number) => {
    addCommentInState(posts.setData, comment, postId);
    addCommentInState(feed.setData, comment, postId);
  };

  return (
    <PostScrollList
      posts={posts.data!}
      onProfilePress={onProfilePress}
      initialIndex={Number(initialIndex)}
      setPosts={posts.setData}
      onLike={onLike}
      onUnlike={onUnlike}
      onComment={onComment}
    />
  );
};

export default FeedProfilePostsListScreen;
