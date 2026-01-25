import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { RefreshControl, View } from "react-native";

import { getSavedPostsForQuery } from "@/api/post";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { getNextPageParam } from "@/utils/utils";

const SavedPostsScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const { selectedProfileId } = useAuthUserContext();

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

  const handleEndReached = () => {
    const hasErrors = posts.isError || posts.isFetchNextPageError;
    const isLoading = posts.isLoading || posts.isFetchingNextPage;

    if (posts.hasNextPage && !hasErrors && !isLoading) {
      posts.fetchNextPage();
    }
  };

  return (
    <FlashList
      showsVerticalScrollIndicator={false}
      data={postsData ?? []}
      numColumns={3}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
      onEndReached={handleEndReached}
      ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
      refreshing={posts.isRefetching}
      refreshControl={
        <RefreshControl
          refreshing={posts.isRefetching}
          onRefresh={posts.refetch}
          tintColor={COLORS.zinc[400]}
          colors={[COLORS.zinc[400]]}
        />
      }
      ListEmptyComponent={
        <ListEmptyComponent
          isLoading={!posts.data || posts.isLoading}
          isError={posts.isError}
          isRefetching={posts.isRefetching}
          loadingComponent={<PostTileSkeleton />}
          errorMessage="There was an error fetching your saved posts."
          errorSubMessage="Swipe down to try again."
          emptyMessage="You haven't saved any posts yet."
        />
      }
      renderItem={({ item: post, index }) => (
        <PostTile
          post={post}
          index={index}
          onPress={() => router.push({ pathname: "/(app)/posts/savedPostsList", params: { initialIndex: index } })}
        />
      )}
      ListFooterComponent={
        <LoadingRetryFooter
          isLoading={posts.isFetchingNextPage}
          isError={posts.isFetchNextPageError}
          fetchNextPage={posts.fetchNextPage}
          message="Oh no! There was an error fetching more posts!"
        />
      }
    />
  );
};

export default SavedPostsScreen;
