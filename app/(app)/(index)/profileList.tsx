import { useLocalSearchParams, useRouter } from "expo-router";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useFeedPostsContext } from "@/context/FeedPostsContext";
import { useProfileDetailsContext } from "@/context/ProfileDetailsContext";
import { addCommentInState, likePostInState, unlikePostInState } from "@/utils/utils";

const FeedProfilePostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { posts } = useProfileDetailsContext();
  const feed = useFeedPostsContext();
  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  const onLike = (postId: number) => {
    likePostInState(posts.setData, postId);
    likePostInState(feed.setData, postId);
  };

  const onUnlike = (postId: number) => {
    unlikePostInState(posts.setData, postId);
    unlikePostInState(feed.setData, postId);
  };

  const onComment = (postId: number) => {
    addCommentInState(posts.setData, postId);
    addCommentInState(feed.setData, postId);
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
