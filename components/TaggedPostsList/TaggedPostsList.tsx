import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";

import { getTaggedPostsForQuery } from "@/api/post";
import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";
import { minutesToMilliseconds } from "@/utils/utils";

type Props = {
  profileId: string;
  initialIndex: string;
  onProfilePress: (profileId: string, username?: string) => void;
};

const TaggedPostsListScreen = ({ profileId, initialIndex, onProfilePress }: Props) => {
  const { selectedProfileId } = useAuthProfileContext();

  const router = useRouter();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getTaggedPostsForQuery(profileId, pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: queryKeys.posts.tagged(selectedProfileId, profileId),
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    staleTime: profileId === selectedProfileId ? 0 : minutesToMilliseconds(5),
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

  return <PostScrollList posts={postsData} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default TaggedPostsListScreen;
