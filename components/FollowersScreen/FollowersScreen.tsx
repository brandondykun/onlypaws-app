import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { View, RefreshControl, Pressable, StyleSheet } from "react-native";

import { getFollowersForQuery } from "@/api/interactions";
import FollowListProfile from "@/components/FollowListProfile/FollowListProfile";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import HeaderSearchInput from "@/components/HeaderSearchInput/HeaderSearchInput";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import SearchListHeader from "@/components/SearchListHeader/SearchListHeader";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import Text from "@/shared/ui/Text/Text";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam } from "@/utils/utils";

type Props = {
  onProfilePress: (publicId: string, username?: string) => void;
  profileId: string;
  username?: string;
};

const FollowersScreen = ({ onProfilePress, profileId, username }: Props) => {
  const { selectedProfileId } = useAuthProfileContext();
  const navigation = useNavigation();

  // Search state
  const [searchText, setSearchTextState] = useState("");
  const [submittedSearchText, setSubmittedSearchText] = useState("");

  useLayoutEffect(() => {
    const title = username ? `@${username}` : "";
    const isOwnProfile = profileId === selectedProfileId;
    navigation.setOptions({
      title: isOwnProfile ? "Profiles that follow you" : title,
    });
  }, [username, navigation, profileId, selectedProfileId]);

  const setSearchText = useCallback((text: string) => {
    setSearchTextState(text);
    if (!text.trim()) {
      setSubmittedSearchText("");
    }
  }, []);

  const searchProfiles = useCallback(() => {
    if (searchText.trim()) {
      setSubmittedSearchText(searchText.trim());
    }
  }, [searchText]);

  const tabBarHeight = useBottomTabBarHeight();

  // Fetch functions
  const fetchFollowers = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowersForQuery(profileId, pageParam);
    return res.data;
  };

  const fetchSearchResults = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowersForQuery(profileId, pageParam, submittedSearchText);
    return res.data;
  };

  // Main followers query
  const followersQuery = useInfiniteQuery({
    queryKey: queryKeys.profile.followers(selectedProfileId, profileId),
    queryFn: fetchFollowers,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
  });

  // Search query
  const searchQuery = useInfiniteQuery({
    queryKey: queryKeys.followers.search(selectedProfileId, profileId, submittedSearchText),
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
  const searchEmptyComponent = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: tabBarHeight + 32 }}>
      <Text style={{ textAlign: "center", fontSize: 20 }} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[600]}>
        {isSearchActive ? "No results found" : "No followers yet!"}
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
          errorMessage="There was an error."
          errorSubMessage="Swipe down to retry."
          customEmptyComponent={searchEmptyComponent}
        />
      }
      ListHeaderComponent={
        <>
          <View style={s.searchInputContainer}>
            <HeaderSearchInput
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={searchProfiles}
              placeholder="Search followers..."
              autoFocus={false}
              disabled={followers.length === 0}
            />
          </View>
          <SearchListHeader defaultText="All followers" searchText={submittedSearchText} />
        </>
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
        <Pressable onPress={() => onProfilePress(profile.public_id, profile.username)}>
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
  );
};

export default FollowersScreen;

const s = StyleSheet.create({
  searchInputContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
