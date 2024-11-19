import { useLocalSearchParams, useRouter } from "expo-router";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";

const ExploreProfilePostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { likePost, unlikePost, addComment, selectedProfilePosts, setSelectedProfilePosts } = useExplorePostsContext();

  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  return (
    <PostScrollList
      posts={selectedProfilePosts!}
      onProfilePress={onProfilePress}
      initialIndex={Number(initialIndex)}
      setPosts={setSelectedProfilePosts}
      onLike={likePost}
      onUnlike={unlikePost}
      onComment={addComment}
    />
  );
};

export default ExploreProfilePostsListScreen;
