import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";

import { getSavedPostsForQuery } from "@/api/post";
import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { getNextPageParam } from "@/utils/utils";
import { minutesToMilliseconds } from "@/utils/utils";

type Props = {
  profileId: string;
  initialIndex: string;
  onProfilePress: (profileId: number) => void;
};

const TaggedPostsListScreen = ({ profileId, initialIndex, onProfilePress }: Props) => {
  const { selectedProfileId } = useAuthUserContext();

  const router = useRouter();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getSavedPostsForQuery(pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: [selectedProfileId, "posts", "tagged", profileId.toString()],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    staleTime: profileId === selectedProfileId?.toString() ? 0 : minutesToMilliseconds(5),
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

  return <PostScrollList posts={postsData} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default TaggedPostsListScreen;
