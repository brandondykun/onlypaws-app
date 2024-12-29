import { useLocalSearchParams, useRouter } from "expo-router";

import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useFeedProfileDetailsContext } from "@/context/FeedProfileDetailsContext";

const FeedProfilePostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const { posts } = useFeedProfileDetailsContext();
  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  return <PostScrollList posts={posts.data!} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default FeedProfilePostsListScreen;
