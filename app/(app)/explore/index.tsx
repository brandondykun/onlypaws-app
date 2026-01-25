import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { View, Dimensions, RefreshControl, StyleSheet } from "react-native";

import { getExplorePostsForQuery } from "@/api/post";
import Button from "@/components/Button/Button";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
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
    return explorePosts.data?.pages.flatMap((page) => page.results) ?? undefined;
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

  const handleEndReached = () => {
    const hasErrors = explorePosts.isError || explorePosts.isFetchNextPageError;
    const isLoading = explorePosts.isLoading || explorePosts.isFetchingNextPage;

    if (explorePosts.hasNextPage && !hasErrors && !isLoading) {
      explorePosts.fetchNextPage();
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: 8 }}>
      <FlashList
        showsVerticalScrollIndicator={false}
        data={dataToRender}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: tabBarHeight, flexGrow: 1 }}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
        onEndReached={handleEndReached}
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
        ListEmptyComponent={
          <ListEmptyComponent
            isLoading={!explorePosts.data || explorePosts.isLoading}
            isError={explorePosts.isError}
            isRefetching={explorePosts.isRefetching}
            loadingComponent={<PostTileSkeleton />}
            errorMessage="There was an error fetching your explore posts."
            emptyMessage="There are no posts to display"
          />
        }
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
        ListFooterComponent={
          <LoadingRetryFooter
            isLoading={explorePosts.isFetchingNextPage}
            isError={explorePosts.isFetchNextPageError}
            fetchNextPage={explorePosts.fetchNextPage}
            message="Oh no! There was an error fetching more posts!"
          />
        }
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
