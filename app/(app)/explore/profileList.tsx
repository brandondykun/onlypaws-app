import { useLocalSearchParams, useRouter } from "expo-router";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";

const ExploreProfilePostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { selectedProfilePosts } = useExplorePostsContext();

  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  return (
    <PostScrollList posts={selectedProfilePosts!} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />
  );
};

export default ExploreProfilePostsListScreen;
