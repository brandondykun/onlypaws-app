import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";

import { getProfilePostsForQuery } from "@/api/profile";
import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";

const PostsListScreen = () => {
  const { authProfile, selectedProfileId } = useAuthProfileContext();
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getProfilePostsForQuery(selectedProfileId, pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: queryKeys.posts.authProfile(selectedProfileId),
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
  });

  // Memoize the flattened posts data
  const dataToRender = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

  const router = useRouter();

  const onProfilePress = (profileId: number, username?: string) => {
    if (profileId === authProfile.id) {
      router.back();
      return;
    }
    router.push({
      pathname: "/(app)/posts/profileDetails",
      params: { profileId: profileId.toString(), username: username },
    });
  };

  return <PostScrollList posts={dataToRender} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default PostsListScreen;
