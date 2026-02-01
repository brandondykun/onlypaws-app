import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View, RefreshControl, Pressable } from "react-native";

import { getFollowersForQuery } from "@/api/interactions";
import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import SearchListHeader from "@/components/SearchListHeader/SearchListHeader";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthProfileFollowersContext } from "@/context/AuthProfileFollowersContext";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";

const FollowersScreen = () => {
  const { selectedProfileId } = useAuthProfileContext();
  const { submittedSearchText } = useAuthProfileFollowersContext();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  // Fetch functions
  const fetchFollowers = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowersForQuery(selectedProfileId, pageParam);
    return res.data;
  };

  const fetchSearchResults = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowersForQuery(selectedProfileId, pageParam, submittedSearchText);
    return res.data;
  };

  // Main followers query
  const followersQuery = useInfiniteQuery({
    queryKey: queryKeys.profile.followers(selectedProfileId, selectedProfileId),
    queryFn: fetchFollowers,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
  });

  // Search query
  const searchQuery = useInfiniteQuery({
    queryKey: queryKeys.followers.search(selectedProfileId, submittedSearchText),
    queryFn: fetchSearchResults,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!submittedSearchText,
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

  // Search empty component for when search has no results
  const searchEmptyComponent = isSearchActive ? (
    <View style={{ marginTop: 48 }}>
      <Text style={{ textAlign: "center", fontSize: 20 }} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        No results found
      </Text>
    </View>
  ) : undefined;

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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        onEndReachedThreshold={0.3}
        onEndReached={handleEndReached}
        refreshing={activeQuery.isRefetching && !activeQuery.isFetchingNextPage}
        ListEmptyComponent={
          <ListEmptyComponent
            isLoading={activeQuery.isLoading}
            isError={activeQuery.isError}
            isRefetching={activeQuery.isRefetching}
            errorMessage="There was an error."
            errorSubMessage="Swipe down to retry."
            customEmptyComponent={searchEmptyComponent}
          />
        }
        ListHeaderComponent={<SearchListHeader defaultText="All followers" searchText={submittedSearchText} />}
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
