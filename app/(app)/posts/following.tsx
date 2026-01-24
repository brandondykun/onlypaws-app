import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View, ActivityIndicator, RefreshControl, StyleSheet, Pressable } from "react-native";

import { getFollowingForQuery } from "@/api/interactions";
import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileFollowingContext } from "@/context/AuthProfileFollowingContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { getNextPageParam } from "@/utils/utils";

const FollowingScreen = () => {
  const { submittedSearchText } = useAuthProfileFollowingContext();
  const { selectedProfileId } = useAuthUserContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  // Fetch functions
  const fetchFollowing = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowingForQuery(selectedProfileId!, pageParam);
    return res.data;
  };

  const fetchSearchResults = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowingForQuery(selectedProfileId!, pageParam, submittedSearchText);
    return res.data;
  };

  // Main following query
  const followingQuery = useInfiniteQuery({
    queryKey: [selectedProfileId, "following", selectedProfileId],
    queryFn: fetchFollowing,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId,
  });

  // Search query
  const searchQuery = useInfiniteQuery({
    queryKey: [selectedProfileId, "following", "search", submittedSearchText],
    queryFn: fetchSearchResults,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId && !!submittedSearchText,
  });

  // Flattened data
  const following = useMemo(() => {
    return followingQuery.data?.pages.flatMap((page) => page.results) ?? [];
  }, [followingQuery.data]);

  const searchResults = useMemo(() => {
    return searchQuery.data?.pages.flatMap((page) => page.results) ?? [];
  }, [searchQuery.data]);

  const isSearchActive = !!submittedSearchText;

  // Determine which query and data to use based on search state
  const activeQuery = isSearchActive ? searchQuery : followingQuery;
  const dataToRender = useMemo(() => {
    return isSearchActive ? searchResults : following;
  }, [isSearchActive, searchResults, following]);

  // Footer component for loading and error states
  const footerComponent = activeQuery.isFetchingNextPage ? (
    <LoadingFooter />
  ) : activeQuery.isFetchNextPageError ? (
    <RetryFetchFooter
      fetchFn={activeQuery.fetchNextPage}
      message="There was an error loading more profiles."
      buttonText="Retry"
    />
  ) : null;

  // Empty component handling different states
  const emptyComponent =
    activeQuery.isLoading || (activeQuery.isError && activeQuery.isRefetching) ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 72 }}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    ) : activeQuery.isError ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 72 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error loading following. Swipe down to try again.
        </Text>
      </View>
    ) : isSearchActive ? (
      // No search results found
      <View style={{ marginTop: 48 }}>
        <Text
          style={{ textAlign: "center", fontSize: 20, fontWeight: "300" }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          No results found
        </Text>
      </View>
    ) : (
      // No following yet
      <View style={s.emptyComponent}>
        <Text style={s.emptyComponentMainText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          You are not following any profiles.
        </Text>
        <Text style={s.emptyComponentSubText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
          Get out there and find some profiles to follow!
        </Text>
      </View>
    );

  const handleEndReached = () => {
    const hasErrors = activeQuery.isError || activeQuery.isFetchNextPageError;
    const isLoading = activeQuery.isLoading || activeQuery.isFetchingNextPage;

    if (activeQuery.hasNextPage && !hasErrors && !isLoading) {
      activeQuery.fetchNextPage();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={emptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        onEndReachedThreshold={0.3}
        onEndReached={handleEndReached}
        refreshing={activeQuery.isRefetching && !activeQuery.isFetchingNextPage}
        ListHeaderComponent={
          <View style={{ marginVertical: 16 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "600", paddingLeft: 16, paddingTop: 16 }}
              darkColor={COLORS.zinc[300]}
              lightColor={COLORS.zinc[600]}
            >
              All Following
            </Text>
          </View>
        }
        refreshControl={
          isSearchActive ? undefined : (
            <RefreshControl
              refreshing={activeQuery.isRefetching && !activeQuery.isFetchingNextPage}
              onRefresh={activeQuery.refetch}
              tintColor={COLORS.zinc[400]}
              colors={[COLORS.zinc[400]]}
            />
          )
        }
        renderItem={({ item: profile }) => (
          <Pressable
            onPress={() => {
              router.push({ pathname: "/(app)/posts/profileDetails", params: { profileId: profile.id } });
            }}
          >
            <FollowListProfile profile={profile} />
          </Pressable>
        )}
        ListFooterComponent={footerComponent}
      />
    </View>
  );
};

export default FollowingScreen;

const s = StyleSheet.create({
  emptyComponent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginTop: 48,
  },
  emptyComponentMainText: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 36,
    fontWeight: "300",
  },
  emptyComponentSubText: {
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 36,
    fontWeight: "300",
  },
});
