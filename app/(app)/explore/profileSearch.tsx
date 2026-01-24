import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View, Platform, RefreshControl, ActivityIndicator } from "react-native";

import { searchProfilesForQuery } from "@/api/profile";
import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import SearchedProfilePreview from "@/components/SearchedProfilePreview/SearchedProfilePreview";
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
    return profileSearch.data?.pages.flatMap((page) => page.results) ?? [];
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

  // Footer component for loading and error states
  const footerComponent = profileSearch.isFetchingNextPage ? (
    <LoadingFooter />
  ) : profileSearch.isFetchNextPageError ? (
    <RetryFetchFooter
      fetchFn={profileSearch.fetchNextPage}
      message="There was an error loading more profiles."
      buttonText="Retry"
    />
  ) : null;

  // Empty component when no results are found
  const emptyComponent =
    profileSearch.isLoading || (profileSearch.isError && profileSearch.isRefetching) ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 72 }}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    ) : profileSearch.isError ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 72 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.red[600] }}>
          There was an error with that search. Swipe down to try again.
        </Text>
      </View>
    ) : !profileSearch.isRefetching ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 72 }}>
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
          No profiles found with that username.
        </Text>
      </View>
    ) : null;

  // Initial state - no search submitted yet
  if (!submittedSearchText) {
    return (
      <View style={{ flex: 1, alignItems: "center", paddingTop: Platform.OS === "android" ? 0 : 30 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "400", color: COLORS.zinc[500] }}>
          Enter a username to search.
        </Text>
      </View>
    );
  }

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
        contentContainerStyle={{ paddingBottom: tabBarHeight, paddingTop: Platform.OS === "android" ? 0 : 24 }}
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={emptyComponent}
        showsVerticalScrollIndicator={false}
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
            onRefresh={profileSearch.refetch}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
        ListFooterComponent={footerComponent}
      />
    </View>
  );
};

export default ProfileSearchScreen;
