import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import { useState, useLayoutEffect, useCallback, useEffect } from "react";
import { View, Dimensions, RefreshControl, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native";

import { axiosFetch } from "@/api/config";
import { getExplorePosts } from "@/api/post";
import Button from "@/components/Button/Button";
import PostTileSkeleton from "@/components/LoadingSkeletons/PostTileSkeleton";
import PostTile from "@/components/PostTile/PostTile";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { PaginatedExploreResponse } from "@/types";

const screenWidth = Dimensions.get("window").width;

const ExploreScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const { authProfile } = useAuthProfileContext();
  const { isDarkMode } = useColorMode();
  const tabBarHeight = useBottomTabBarHeight();

  const { explorePosts, setExplorePosts, setSimilarPosts } = useExplorePostsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  // add search button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ width: screenWidth, marginLeft: -16, alignItems: "center" }}>
          <Button
            buttonStyle={[
              s.headerSearchButton,
              {
                backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
                borderColor: isDarkMode ? COLORS.zinc[600] : COLORS.zinc[400],
              },
            ]}
            textStyle={s.headerSearchButtonFont}
            onPress={() => router.push("/(app)/explore/profileSearch")}
            text="Search profiles..."
          />
        </View>
      ),
    });
  });

  // initial fetch or refresh fetch if initial fetch fails
  const fetchPosts = useCallback(async () => {
    if (authProfile.id) {
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { error, data } = await getExplorePosts(authProfile.id);
      if (!error && data) {
        setExplorePosts(data.results);
        setFetchNextUrl(data.next);
      } else {
        setHasInitialFetchError(true);
      }
      setInitialFetchComplete(true);
      setRefreshing(false);
    }
  }, [authProfile.id, setExplorePosts]);

  // refresh posts fetch if user swipes down
  const refreshPosts = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchPosts();
    setRefreshing(false);
  };

  // perform initial explore posts fetch
  useEffect(() => {
    fetchPosts();
  }, [authProfile.id, fetchPosts]);

  // fetch next paginated list of explore posts
  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data } = await axiosFetch<PaginatedExploreResponse>(fetchNextUrl);
      if (!error && data) {
        setExplorePosts((prev) => [...prev, ...data.results]);
        setFetchNextUrl(data.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl, setExplorePosts]);

  // content to be displayed in the footer
  const footerComponent = fetchNextLoading ? (
    <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 16 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="small" />
    </View>
  ) : hasFetchNextError ? (
    <View style={{ paddingVertical: 48, alignItems: "center", paddingHorizontal: 24 }}>
      <Text style={{ color: COLORS.red[600], textAlign: "center" }}>
        Oh no! There was an error fetching more posts.
      </Text>
      <Button text="Retry" variant="text" onPress={() => fetchNext()} />
    </View>
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
        onEndReachedThreshold={0.3} // Trigger when 10% from the bottom
        onEndReached={!fetchNextLoading && !hasFetchNextError && !hasInitialFetchError ? () => fetchNext() : null}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        refreshing={refreshing}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshPosts}
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
    width: screenWidth - 50,
    borderWidth: 1,
    flex: 1,
    justifyContent: "flex-start",
    paddingLeft: 9,
    height: 35,
  },
  headerSearchButtonFont: {
    fontSize: 16,
    color: COLORS.zinc[500],
    textAlign: "left",
  },
});
