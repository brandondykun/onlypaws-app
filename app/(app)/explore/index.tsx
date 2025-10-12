import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { View, Dimensions, RefreshControl, StyleSheet } from "react-native";

import Button from "@/components/Button/Button";
import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useColorMode } from "@/context/ColorModeContext";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";

const screenWidth = Dimensions.get("window").width;

const ExploreScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const { setLightOrDark } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();

  const {
    explorePosts,
    setSimilarPosts,
    refresh,
    refreshing,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextLoading,
    hasFetchNextError,
  } = useExplorePostsContext();

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ width: screenWidth, paddingHorizontal: 16 }}>
          <Button
            buttonStyle={[
              s.headerSearchButton,
              {
                backgroundColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[800]),
                borderColor: setLightOrDark(COLORS.zinc[200], COLORS.zinc[900]),
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
  });

  // content to be displayed in the footer
  const footerComponent = fetchNextLoading ? (
    <LoadingFooter />
  ) : hasFetchNextError ? (
    <RetryFetchFooter fetchFn={fetchNext} message="Oh no! There was an error fetching more posts!" buttonText="Retry" />
  ) : null;

  const emptyComponent =
    !initialFetchComplete || (hasInitialFetchError && refreshing) ? (
      <PostTileSkeleton />
    ) : hasInitialFetchError ? (
      <View style={{ paddingTop: 96, paddingHorizontal: 24 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error fetching your explore posts. Swipe down to try again.
        </Text>
      </View>
    ) : !refreshing ? (
      <View style={{ flex: 1, justifyContent: "center", paddingTop: "50%" }}>
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
          There are no posts to display.
        </Text>
      </View>
    ) : null;

  return (
    <View style={{ flex: 1, paddingTop: 8 }}>
      <FlashList
        showsVerticalScrollIndicator={false}
        data={explorePosts}
        numColumns={3}
        estimatedItemSize={screenWidth / 3}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
        onEndReached={!fetchNextLoading && !hasFetchNextError && !hasInitialFetchError ? () => fetchNext() : null}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        refreshing={refreshing}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
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
              setSimilarPosts([post]);
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
    flex: 1,
    justifyContent: "flex-start",
    paddingLeft: 16,
    height: 40,
  },
  headerSearchButtonFont: {
    fontSize: 18,
    color: COLORS.zinc[500],
  },
});
