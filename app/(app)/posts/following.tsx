import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View, RefreshControl, Pressable } from "react-native";

import { getFollowingForQuery } from "@/api/interactions";
import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import SearchListHeader from "@/components/SearchListHeader/SearchListHeader";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthProfileFollowingContext } from "@/context/AuthProfileFollowingContext";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";

const FollowingScreen = () => {
  const { selectedProfileId } = useAuthProfileContext();
  const { submittedSearchText } = useAuthProfileFollowingContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  // Fetch functions
  const fetchFollowing = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowingForQuery(selectedProfileId, pageParam);
    return res.data;
  };

  const fetchSearchResults = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowingForQuery(selectedProfileId, pageParam, submittedSearchText);
    return res.data;
  };

  // Main following query
  const followingQuery = useInfiniteQuery({
    queryKey: queryKeys.profile.following(selectedProfileId, selectedProfileId.toString()),
    queryFn: fetchFollowing,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
  });

  // Search query
  const searchQuery = useInfiniteQuery({
    queryKey: queryKeys.following.search(selectedProfileId, submittedSearchText),
    queryFn: fetchSearchResults,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!submittedSearchText,
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

  // Search empty component for when search has no results
  const searchEmptyComponent = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: tabBarHeight + 32 }}>
      <Text style={{ textAlign: "center", fontSize: 20 }} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        {isSearchActive ? "No results found" : "You're not following anyone yet!"}
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
    <FlashList
      data={dataToRender}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight }}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
      refreshing={activeQuery.isRefetching && !activeQuery.isFetchingNextPage}
      ListEmptyComponent={
        <ListEmptyComponent
          isLoading={activeQuery.isLoading}
          isError={activeQuery.isError}
          isRefetching={activeQuery.isRefetching}
          errorMessage="There was an error loading following."
          customEmptyComponent={searchEmptyComponent}
        />
      }
      ListHeaderComponent={<SearchListHeader defaultText="All following" searchText={submittedSearchText} />}
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
              params: { profileId: profile.public_id, username: profile.username },
            });
          }}
        >
          <FollowListProfile profile={profile} />
        </Pressable>
      )}
      ListFooterComponent={
        <LoadingRetryFooter
          isLoading={followingQuery.isFetchingNextPage}
          isError={followingQuery.isFetchNextPageError}
          fetchNextPage={followingQuery.fetchNextPage}
          message="Oh no! There was an error fetching more following!"
        />
      }
    />
  );
};

export default FollowingScreen;
