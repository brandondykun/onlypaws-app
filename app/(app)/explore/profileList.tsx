import { useLocalSearchParams, useRouter } from "expo-router";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useExploreProfileDetailsContext } from "@/context/ExploreProfileDetailsContext";

const ExploreProfilePostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { posts } = useExploreProfileDetailsContext();

  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  return <PostScrollList posts={posts.data!} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default ExploreProfilePostsListScreen;
