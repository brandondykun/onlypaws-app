import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";

import { getProfilePostsForQuery } from "@/api/profile";
import PostScrollList from "@/components/PostScrollList/PostScrollList";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";

const ExploreProfilePostsListScreen = () => {
  const { authProfile, selectedProfileId } = useAuthProfileContext();
  const { initialIndex, profileId } = useLocalSearchParams<{ initialIndex: string; profileId: string }>();

  const router = useRouter();

  const onProfilePress = (publicId: string, username?: string) => {
    if (publicId === authProfile.public_id || publicId === profileId) {
      router.back();
      return;
    }
    router.push({
      pathname: "/(app)/profile/profileDetails",
      params: { profileId: publicId, username: username },
    });
  };

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getProfilePostsForQuery(profileId, pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: queryKeys.posts.profile(selectedProfileId, profileId),
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
  });

  // Memoize the flattened posts data
  const postsData = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

  return <PostScrollList posts={postsData!} onProfilePress={onProfilePress} initialIndex={Number(initialIndex)} />;
};

export default ExploreProfilePostsListScreen;
