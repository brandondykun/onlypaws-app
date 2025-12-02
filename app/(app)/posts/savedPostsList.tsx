import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";

import { getSavedPostsForQuery } from "@/api/post";
import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { getNextPageParam } from "@/utils/utils";

const SavedPostsListScreen = () => {
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();
  const { selectedProfileId } = useAuthUserContext();

  const router = useRouter();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getSavedPostsForQuery(pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: [selectedProfileId, "posts", "saved"],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId,
  });

  // Memoize the flattened posts data
  const postsData = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

  useEffect(() => {
    if (!posts.isLoading && !postsData.length) {
      router.back();
    }
  }, [router, posts.isLoading, postsData.length]);

  const onProfilePress = () => {
    router.back();
  };

  return <PostScrollList posts={postsData} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default SavedPostsListScreen;
