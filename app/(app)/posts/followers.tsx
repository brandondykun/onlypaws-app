import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View, ActivityIndicator, RefreshControl, StyleSheet, Pressable } from "react-native";

import { getFollowersForQuery } from "@/api/interactions";
import FollowListHeader from "@/components/FollowListHeader/FollowListHeader";
import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileFollowersContext } from "@/context/AuthProfileFollowersContext";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { getNextPageParam } from "@/utils/utils";

const FollowersScreen = () => {
  const { submittedSearchText } = useAuthProfileFollowersContext();
  const { selectedProfileId } = useAuthUserContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  // Fetch functions
  const fetchFollowers = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowersForQuery(selectedProfileId!, pageParam);
    return res.data;
  };

  const fetchSearchResults = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowersForQuery(selectedProfileId!, pageParam, submittedSearchText);
    return res.data;
  };

  // Main followers query
  const followersQuery = useInfiniteQuery({
    queryKey: [selectedProfileId, "followers", selectedProfileId],
    queryFn: fetchFollowers,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId,
  });

  // Search query
  const searchQuery = useInfiniteQuery({
    queryKey: [selectedProfileId, "followers", "search", submittedSearchText],
    queryFn: fetchSearchResults,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId && !!submittedSearchText,
  });

  // Flattened data
  const followers = useMemo(() => {
    return followersQuery.data?.pages.flatMap((page) => page.results) ?? [];
  }, [followersQuery.data]);

  const searchResults = useMemo(() => {
    return searchQuery.data?.pages.flatMap((page) => page.results) ?? [];
  }, [searchQuery.data]);

  const isSearchActive = !!submittedSearchText;

  // Determine which query and data to use based on search state
  const activeQuery = isSearchActive ? searchQuery : followersQuery;
  const dataToRender = useMemo(() => {
    return isSearchActive ? searchResults : followers;
  }, [isSearchActive, searchResults, followers]);

  // Empty component handling different states
  const emptyComponent =
    activeQuery.isLoading || (activeQuery.isError && activeQuery.isRefetching) ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 72 }}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    ) : activeQuery.isError ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 72 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error loading followers. Swipe down to try again.
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
      // No followers yet
      <View style={s.emptyComponent}>
        <Text style={s.emptyComponentMainText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
          You don't have any followers yet.
        </Text>
        <Text style={s.emptyComponentSubText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
          Keep posting great content to gain some followers!
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
          <FollowListHeader title={isSearchActive ? `Search results for "${submittedSearchText}"` : "All followers"} />
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
              router.push({
                pathname: "/(app)/posts/profileDetails",
                params: { profileId: profile.id, username: profile.username },
              });
            }}
          >
            <FollowListProfile profile={profile} />
          </Pressable>
        )}
        ListFooterComponent={
          <LoadingRetryFooter
            isLoading={followersQuery.isFetchingNextPage}
            isError={followersQuery.isFetchNextPageError}
            fetchNextPage={followersQuery.fetchNextPage}
            message="Oh no! There was an error fetching more followers!"
          />
        }
      />
    </View>
  );
};

export default FollowersScreen;

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
