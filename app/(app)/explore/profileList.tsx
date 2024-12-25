import { useLocalSearchParams, useRouter } from "expo-router";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { useProfileDetailsContext } from "@/context/ProfileDetailsContext";
import { useSavedPostsContext } from "@/context/SavedPostsContext";
import { addCommentInState, likePostInState, unlikePostInState } from "@/utils/utils";

const ExploreProfilePostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { likePost, unlikePost, addComment, selectedProfilePosts, setSelectedProfilePosts } = useExplorePostsContext();
  const savedPosts = useSavedPostsContext();
  const { posts } = useProfileDetailsContext();

  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  const onLike = (postId: number) => {
    likePost(postId);
    likePostInState(savedPosts.setData, postId);
    likePostInState(posts.setData, postId);
  };

  const onUnlike = (postId: number) => {
    unlikePost(postId);
    unlikePostInState(savedPosts.setData, postId);
    unlikePostInState(posts.setData, postId);
  };

  const onComment = (postId: number) => {
    addComment(postId);
    addCommentInState(savedPosts.setData, postId);
    addCommentInState(posts.setData, postId);
  };

  return (
    <PostScrollList
      posts={selectedProfilePosts!}
      onProfilePress={onProfilePress}
      initialIndex={Number(initialIndex)}
      setPosts={setSelectedProfilePosts}
      onLike={onLike}
      onUnlike={onUnlike}
      onComment={onComment}
    />
  );
};

export default ExploreProfilePostsListScreen;
