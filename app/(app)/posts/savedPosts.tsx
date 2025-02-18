import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Dimensions, RefreshControl, View } from "react-native";

import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useSavedPostsContext } from "@/context/SavedPostsContext";

const SavedPostsScreen = () => {
  const posts = useSavedPostsContext();
  const screenWidth = Dimensions.get("window").width;
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      posts.setData((prev) => {
        return prev.filter((prevPost) => {
          return prevPost.is_saved;
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  // content to be displayed in the footer
  const footerComponent = posts.fetchNextLoading ? (
    <LoadingFooter />
  ) : posts.hasFetchNextError ? (
    <RetryFetchFooter
      fetchFn={posts.fetchNext}
      message="Oh no! There was an error fetching more posts!"
      buttonText="Retry"
    />
  ) : null;

  const emptyComponent =
    !posts.initialFetchComplete || (posts.hasInitialFetchError && posts.refreshing) ? (
      <PostTileSkeleton />
    ) : posts.hasInitialFetchError ? (
      <View style={{ paddingTop: 96, paddingHorizontal: 24 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error fetching your saved posts. Swipe down to try again.
        </Text>
      </View>
    ) : !posts.refreshing ? (
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
      data={posts.data}
      numColumns={3}
      estimatedItemSize={screenWidth / 3}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.3} // Trigger when 10% from the bottom
      onEndReached={
        !posts.fetchNextLoading && !posts.hasFetchNextError && !posts.hasInitialFetchError
          ? () => posts.fetchNext()
          : null
      }
      ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
      refreshing={posts.refreshing}
      refreshControl={
        <RefreshControl
          refreshing={posts.refreshing}
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
