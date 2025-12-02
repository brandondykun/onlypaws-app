import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import { getSimilarPostsForQuery } from "@/api/post";
import FlatListLoadingFooter from "@/components/FlatListLoadingFooter/FlatListLoadingFooter";
import Post from "@/components/Post/Post";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { useAdsInList } from "@/hooks/useAdsInList";
import { PostDetailed } from "@/types";
import { getNextPageParam } from "@/utils/utils";

const ExplorePostsListScreen = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { selectedExplorePost } = useExplorePostsContext();
  const { selectedProfileId } = useAuthUserContext();

  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();

  const fetchSimilarPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getSimilarPostsForQuery(postId, pageParam);
    return res.data;
  };

  const similarPosts = useInfiniteQuery({
    queryKey: [selectedProfileId, "posts", "explore", "similar", postId.toString()],
    queryFn: fetchSimilarPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId,
  });

  // Memoize the flattened posts data
  const similarPostsData = useMemo(() => {
    return similarPosts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [similarPosts.data]);

  const onProfilePress = useMemo(
    () => (profileId: number) => {
      router.push({ pathname: "/(app)/explore/profile", params: { profileId: profileId } });
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

  return (
    <FlashList
      data={data}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4} // Trigger when 40% from the bottom
      onEndReached={!similarPosts.isFetchingNextPage ? similarPosts.fetchNextPage : null}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        selectedExplorePost ? <Post post={selectedExplorePost} onProfilePress={onProfilePress} /> : null
      }
      ListFooterComponent={
        !similarPosts.isLoading && similarPosts.isError && !similarPosts.isFetchingNextPage ? (
          <RetryFetchFooter
            fetchFn={() => similarPosts.refetch()}
            message="Oh no! There was an error fetching posts!"
            buttonText="Retry"
          />
        ) : similarPosts.isFetchNextPageError ? (
          <RetryFetchFooter
            fetchFn={() => similarPosts.fetchNextPage()}
            message="Oh no! There was an error fetching more posts!"
            buttonText="Retry"
          />
        ) : (
          <FlatListLoadingFooter
            nextUrl={similarPosts.hasNextPage}
            fetchNextLoading={similarPosts.isFetchingNextPage}
            initialFetchLoading={similarPosts.isLoading}
          />
        )
      }
    />
  );
};

export default ExplorePostsListScreen;
