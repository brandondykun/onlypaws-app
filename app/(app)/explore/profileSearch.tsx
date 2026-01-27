import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View, RefreshControl } from "react-native";

import { searchProfilesForQuery } from "@/api/profile";
import LoadingRetryFooter from "@/components/Footer/LoadingRetryFooter/LoadingRetryFooter";
import ListEmptyComponent from "@/components/ListEmptyComponent/ListEmptyComponent";
import SearchedProfilePreview from "@/components/SearchedProfilePreview/SearchedProfilePreview";
import SearchListHeader from "@/components/SearchListHeader/SearchListHeader";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useFollowRequestsContext } from "@/context/FollowRequestsContext";
import { useProfileDetailsManagerContext } from "@/context/ProfileDetailsManagerContext";
import { useProfileSearchContext } from "@/context/ProfileSearchContext";
import { SearchedProfile } from "@/types";
import { getNextPageParam } from "@/utils/utils";

const ProfileSearchScreen = () => {
  const { submittedSearchText } = useProfileSearchContext();
  const { followProfile, unfollowProfile, cancelFollowRequest } = useProfileDetailsManagerContext();
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const { cancelRequest } = useFollowRequestsContext();

  const fetchProfiles = async ({ pageParam }: { pageParam: string }) => {
    const res = await searchProfilesForQuery(submittedSearchText, pageParam);
    return res.data;
  };

  const profileSearch = useInfiniteQuery({
    queryKey: ["profileSearch", submittedSearchText],
    queryFn: fetchProfiles,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!submittedSearchText,
  });

  // Memoize the flattened profiles data
  const dataToRender = useMemo(() => {
    return profileSearch.data?.pages.flatMap((page) => page.results) ?? undefined;
  }, [profileSearch.data]);

  const handleUnfollowPress = (profileId: number) => {
    unfollowProfile(profileId);
  };

  const handleFollowPress = (searchedProfile: SearchedProfile) => {
    followProfile(searchedProfile.id, { isPrivate: searchedProfile.is_private });
  };

  const handleCancelFollowRequest = async (profileId: number) => {
    // Optimistic update
    cancelFollowRequest(profileId);

    try {
      await cancelRequest(profileId);
    } catch {
      // Revert on failure - restore the follow request state
      followProfile(profileId, { isPrivate: true });
    }
  };

  const handleProfilePress = (profileId: number, username?: string) => {
    router.push({
      pathname: "/(app)/explore/profileDetails",
      params: { profileId: profileId.toString(), username: username },
    });
  };

  // Custom empty component for search states
  const searchEmptyComponent = (
    <View style={{ marginTop: 48 }}>
      <Text style={{ textAlign: "center", fontSize: 20, color: COLORS.zinc[500] }}>
        {!submittedSearchText ? "Enter a username to search" : "No results found"}
      </Text>
    </View>
  );

  const handleEndReached = () => {
    const hasErrors = profileSearch.isError || profileSearch.isFetchNextPageError;
    const isLoading = profileSearch.isLoading || profileSearch.isFetchingNextPage;

    if (profileSearch.hasNextPage && !hasErrors && !isLoading) {
      profileSearch.fetchNextPage();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <ListEmptyComponent
            isLoading={profileSearch.isLoading}
            isError={profileSearch.isError}
            isRefetching={profileSearch.isRefetching}
            errorMessage="There was an error with that search."
            errorSubMessage="Swipe down to try again."
            customEmptyComponent={searchEmptyComponent}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<SearchListHeader defaultText="" searchText={submittedSearchText} />}
        renderItem={({ item: profile }) => (
          <SearchedProfilePreview
            profile={profile}
            handleFollowPress={handleFollowPress}
            handleUnfollowPress={handleUnfollowPress}
            key={profile.id}
            onPress={handleProfilePress}
            handleCancelFollowRequest={handleCancelFollowRequest}
          />
        )}
        onEndReachedThreshold={0.3}
        onEndReached={handleEndReached}
        refreshing={profileSearch.isRefetching}
        refreshControl={
          <RefreshControl
            refreshing={profileSearch.isRefetching}
            onRefresh={submittedSearchText ? profileSearch.refetch : undefined}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        ListFooterComponent={
          <LoadingRetryFooter
            isLoading={profileSearch.isFetchingNextPage}
            isError={profileSearch.isFetchNextPageError}
            fetchNextPage={profileSearch.fetchNextPage}
            message="Oh no! There was an error fetching more profiles!"
          />
        }
      />
    </View>
  );
};

export default ProfileSearchScreen;
