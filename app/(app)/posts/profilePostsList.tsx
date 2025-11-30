import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";

import { getProfilePostsForQuery } from "@/api/profile";
import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { getNextPageParam } from "@/utils/utils";

const FeedProfilePostsListScreen = () => {
  const { initialIndex, profileId } = useLocalSearchParams<{ initialIndex: string; profileId: string }>();

  const router = useRouter();

  const onProfilePress = () => {
    router.back();
  };

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getProfilePostsForQuery(profileId, pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: ["posts", "profile", profileId.toString()],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
  });

  // Memoize the flattened posts data
  const postsData = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

  return <PostScrollList posts={postsData} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default FeedProfilePostsListScreen;
