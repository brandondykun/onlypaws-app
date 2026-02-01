import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import { getSimilarPostsForQuery } from "@/api/post";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import Post from "@/components/Post/Post";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { useAdsInList } from "@/hooks/useAdsInList";
import { PostDetailed } from "@/types";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";

const ExplorePostsListScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { selectedExplorePost } = useExplorePostsContext();
  const { selectedProfileId } = useAuthProfileContext();

  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();

  const fetchSimilarPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getSimilarPostsForQuery(postId, pageParam);
    return res.data;
  };

  const similarPosts = useInfiniteQuery({
    queryKey: queryKeys.posts.similar(selectedProfileId, postId),
    queryFn: fetchSimilarPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
  });

  // Memoize the flattened posts data
  const similarPostsData = useMemo(() => {
    return similarPosts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [similarPosts.data]);

  const onProfilePress = useMemo(
    () => (profileId: number, username?: string) => {
      router.push({
        pathname: "/(app)/explore/profileDetails",
        params: { profileId: profileId.toString(), username: username },
      });
    },
    [router],
  );

  // Render function for posts
  const renderPost = useCallback(
    (post: PostDetailed) => <Post post={post} onProfilePress={onProfilePress} />,
    [onProfilePress],
  );

  // Use the ads hook - handles everything automatically!
  const { data, renderItem, keyExtractor } = useAdsInList({
    items: similarPostsData ?? [],
    renderItem: renderPost,
  });

  const hasInitialFetchError = !similarPosts.isLoading && similarPosts.isError && !similarPosts.isFetchNextPageError;

  const handleEndReached = () => {
    const hasErrors = similarPosts.isError || similarPosts.isFetchNextPageError;
    const isLoading = similarPosts.isLoading || similarPosts.isFetchingNextPage;

    if (similarPosts.hasNextPage && !hasErrors && !isLoading) {
      similarPosts.fetchNextPage();
    }
  };

  return (
    <FlashList
      data={data}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
      onEndReached={handleEndReached}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        selectedExplorePost ? <Post post={selectedExplorePost} onProfilePress={onProfilePress} /> : null
      }
      ListFooterComponent={
        <LoadingRetryFooter
          isLoading={similarPosts.isLoading || similarPosts.isFetchingNextPage}
          isError={similarPosts.isError}
          fetchNextPage={hasInitialFetchError ? similarPosts.refetch : similarPosts.fetchNextPage}
        />
      }
    />
  );
};

export default ExplorePostsListScreen;
