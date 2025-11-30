import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { RefreshControl, View } from "react-native";

import { getSavedPostsForQuery } from "@/api/post";
import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { getNextPageParam } from "@/utils/utils";

const SavedPostsScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getSavedPostsForQuery(pageParam);
    return res.data;
  };

  const posts = useInfiniteQuery({
    queryKey: ["posts", "saved"],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
  });

  // Memoize the flattened posts data
  const postsData = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

  // content to be displayed in the footer
  const footerComponent = posts.isFetchingNextPage ? (
    <LoadingFooter />
  ) : posts.isFetchNextPageError ? (
    <RetryFetchFooter
      fetchFn={posts.fetchNextPage}
      message="Oh no! There was an error fetching more posts!"
      buttonText="Retry"
    />
  ) : null;

  const emptyComponent =
    posts.isLoading || (posts.isError && posts.isRefetching) ? (
      <PostTileSkeleton />
    ) : posts.isError ? (
      <View style={{ paddingTop: 96, paddingHorizontal: 24 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error fetching your saved posts. Swipe down to try again.
        </Text>
      </View>
    ) : !posts.isRefetching ? (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            paddingHorizontal: 36,
            fontWeight: "300",
            paddingTop: 96,
          }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          You haven't saved any posts yet.
        </Text>
      </View>
    ) : null;

  return (
    <FlashList
      showsVerticalScrollIndicator={false}
      data={postsData ?? []}
      numColumns={3}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.3} // Trigger when 10% from the bottom
      onEndReached={
        !posts.isFetchingNextPage && !posts.isFetchNextPageError && !posts.isError ? () => posts.fetchNextPage() : null
      }
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
      ListEmptyComponent={emptyComponent}
      renderItem={({ item: post, index }) => (
        <PostTile
          post={post}
          index={index}
          onPress={() => router.push({ pathname: "/(app)/posts/savedPostsList", params: { initialIndex: index } })}
        />
      )}
      ListFooterComponent={footerComponent}
    />
  );
};

export default SavedPostsScreen;
