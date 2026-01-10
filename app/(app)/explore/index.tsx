import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { View, Dimensions, RefreshControl, StyleSheet } from "react-native";

import { getExplorePostsForQuery } from "@/api/post";
import Button from "@/components/Button/Button";
import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { getNextPageParam } from "@/utils/utils";

const screenWidth = Dimensions.get("window").width;

const ExploreScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();
  const { selectedProfileId } = useAuthUserContext();

  const { setSelectedExplorePost } = useExplorePostsContext();

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getExplorePostsForQuery(pageParam);
    return res.data;
  };

  const explorePosts = useInfiniteQuery({
    queryKey: [selectedProfileId, "posts", "explore"],
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId,
  });

  // Memoize the flattened posts data
  const dataToRender = useMemo(() => {
    return explorePosts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [explorePosts.data]);

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ width: screenWidth, paddingHorizontal: 16 }}>
          <Button
            buttonStyle={[
              s.headerSearchButton,
              {
                backgroundColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[800]),
                borderColor: setLightOrDark(COLORS.zinc[50], COLORS.zinc[800]),
              },
            ]}
            textStyle={s.headerSearchButtonFont}
            onPressOut={() => router.push("/(app)/explore/profileSearch")}
            text="Search profiles..."
            icon={<Ionicons name="search-outline" size={18} color={COLORS.zinc[500]} />}
          />
        </View>
      ),
    });
  }, [navigation, router, setLightOrDark]);

  // content to be displayed in the footer
  const footerComponent = explorePosts.isFetchingNextPage ? (
    <LoadingFooter />
  ) : explorePosts.isFetchNextPageError ? (
    <RetryFetchFooter
      fetchFn={explorePosts.fetchNextPage}
      message="Oh no! There was an error fetching more posts!"
      buttonText="Retry"
    />
  ) : null;

  const emptyComponent =
    explorePosts.isLoading || (explorePosts.isError && explorePosts.isRefetching) ? (
      <PostTileSkeleton />
    ) : explorePosts.isError ? (
      <View style={{ paddingTop: 96, paddingHorizontal: 24 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error fetching your explore posts. Swipe down to try again.
        </Text>
      </View>
    ) : !explorePosts.isRefetching ? (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 20,
            textAlign: "center",
            paddingHorizontal: 36,
            fontWeight: "300",
          }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          There are no posts to display
        </Text>
      </View>
    ) : null;

  return (
    <View style={{ flex: 1, paddingTop: 8 }}>
      <FlashList
        showsVerticalScrollIndicator={false}
        data={dataToRender}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: tabBarHeight, flexGrow: 1 }}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
        onEndReached={
          explorePosts.hasNextPage &&
          !explorePosts.isFetchingNextPage &&
          !explorePosts.isLoading &&
          !explorePosts.isFetchNextPageError
            ? () => explorePosts.fetchNextPage()
            : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        refreshing={explorePosts.isRefetching}
        refreshControl={
          <RefreshControl
            refreshing={explorePosts.isRefetching}
            onRefresh={explorePosts.refetch}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        ListEmptyComponent={emptyComponent}
        renderItem={({ item: post, index }) => (
          <PostTile
            post={post}
            index={index}
            onPress={() => {
              setSelectedExplorePost(post);
              router.push({ pathname: "/(app)/explore/list", params: { postId: post.id.toString() } });
            }}
          />
        )}
        ListFooterComponent={footerComponent}
      />
    </View>
  );
};

export default ExploreScreen;

const s = StyleSheet.create({
  headerSearchButton: {
    borderRadius: 100,
    width: "100%",
    borderWidth: 1,
    justifyContent: "flex-start",
    paddingLeft: 16,
    height: 44,
  },
  headerSearchButtonFont: {
    fontSize: 18,
    color: COLORS.zinc[500],
  },
});
