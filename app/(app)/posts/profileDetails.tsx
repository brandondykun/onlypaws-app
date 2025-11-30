import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";

import { getProfileDetailsForQuery, getProfilePostsForQuery } from "@/api/profile";
import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";
import { getNextPageParam } from "@/utils/utils";

const PostsProfileDetailsScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/posts/profilePostsList", params: { initialIndex: index, profileId } });
  };

  const fetchProfile = async (id: number | string) => {
    const res = await getProfileDetailsForQuery(id);
    return res.data;
  };

  const profile = useQuery({
    queryKey: ["profile", profileId.toString()],
    queryFn: () => fetchProfile(profileId),
  });

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

  return (
    <ProfileDetails
      profileId={profileId}
      onPostPreviewPress={handlePostPreviewPress}
      profileData={profile.data ?? null}
      profileLoading={profile.isLoading}
      profileRefresh={() => profile.refetch()}
      profileRefreshing={profile.isRefetching}
      profileError={profile.isLoadingError}
      postsLoading={posts.isLoading}
      postsError={posts.isError}
      postsData={postsData}
      postsRefresh={() => posts.refetch()}
      postsRefreshing={posts.isRefetching}
      fetchNext={posts.fetchNextPage}
      fetchNextLoading={posts.isFetchingNextPage}
      hasFetchNextError={posts.isFetchNextPageError}
    />
  );
};

export default PostsProfileDetailsScreen;
