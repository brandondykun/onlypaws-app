import { SimpleLineIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo, useRef } from "react";
import React from "react";
import { View, RefreshControl, Pressable, StyleSheet } from "react-native";

import { getProfileDetailsForQuery, getProfilePostsForQuery } from "@/api/profile";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { useProfileDetailsManagerContext } from "@/context/ProfileDetailsManagerContext";
import { ProfileDetails as ProfileDetailsType } from "@/types";
import { queryKeys } from "@/utils/query/queryKeys";
import { getNextPageParam, minutesToMilliseconds } from "@/utils/utils";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";
import PostTile from "../PostTile/PostTile";
import ProfileDetailsHeader from "../ProfileDetailsHeader/ProfileDetailsHeader";

import ConfirmRemoveFollowerSheet from "./components/ConfirmRemoveFollowerSheet/ConfirmRemoveFollowerSheet";
import EmptyComponent from "./components/EmptyComponent/EmptyComponent";
import ReportProfileModal from "./components/ReportProfileModal/ReportProfileModal";

type Props = {
  profileId: string;
  onPostPreviewPress: (index: number) => void;
  onTaggedPostsPress: () => void;
  username?: string;
  skipInitialRefetch?: boolean;
};

const ProfileDetails = ({
  profileId,
  onPostPreviewPress,
  onTaggedPostsPress,
  username,
  skipInitialRefetch = false,
}: Props) => {
  const navigation = useNavigation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const optionsModalRef = useRef<RNBottomSheetModal>(null);
  const confirmRemoveFollowerSheetRef = useRef<RNBottomSheetModal>(null);
  const profileOptionsModalRef = useRef<RNBottomSheetModal>(null);
  const reportProfileModalRef = useRef<RNBottomSheetModal>(null);

  const { isDarkMode } = useColorMode();
  const { authProfile, selectedProfileId } = useAuthProfileContext();
  const { followProfile, unfollowProfile, removeFollower } = useProfileDetailsManagerContext();

  const fetchProfile = async (public_id: string) => {
    const res = await getProfileDetailsForQuery(public_id);
    return res.data;
  };

  const isOwnProfile = profileId === selectedProfileId;
  // Use the same query key as AuthProfileContext when viewing own profile
  // This ensures cache updates from the context are reflected here
  const profileQueryKey = queryKeys.profile.details(selectedProfileId, profileId);

  const profile = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => fetchProfile(profileId),
    staleTime: isOwnProfile ? 0 : minutesToMilliseconds(5),
  });

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getProfilePostsForQuery(profileId, pageParam);
    return res.data;
  };

  // NOTE: We compare with selectedProfileId directly (not authProfile.id) because authProfile
  // uses placeholderData which can return stale data during profile switches
  const postsQueryKey = isOwnProfile
    ? queryKeys.posts.authProfile(selectedProfileId)
    : queryKeys.posts.profile(selectedProfileId, profileId);

  const posts = useInfiniteQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    staleTime: isOwnProfile ? 0 : minutesToMilliseconds(5),
    // Skip initial refetch when coming from post creation to preserve local images
    refetchOnMount: skipInitialRefetch ? false : true,
  });

  // Memoize the flattened posts data
  const dataToRender = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? undefined;
  }, [posts.data]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: profile.data ? `@${profile.data.username}` : username ? `@${username}` : "",
      headerRight: () => {
        if (profile.data?.id === authProfile.id) {
          // show if user is looking at own profile
          return (
            <Pressable
              onPressOut={() => optionsModalRef.current?.present()}
              style={({ pressed }) => [pressed && { opacity: 0.7 }, { padding: 8 }]}
              hitSlop={20}
              testID="profile-details-menu-button"
            >
              <SimpleLineIcons name="options" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />
            </Pressable>
          );
        } else if (profile.data) {
          // show three-dot menu for other profiles (report + optional remove follower)
          return (
            <Pressable
              onPress={() => profileOptionsModalRef.current?.present()}
              style={({ pressed }) => [pressed && { opacity: 0.7 }, { padding: 8 }]}
              hitSlop={20}
            >
              <Entypo name="dots-three-horizontal" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />
            </Pressable>
          );
        } else {
          return null;
        }
      },
    });
  }, [profile.data, navigation, isDarkMode, authProfile.id, username]);

  const handlePostPreviewPress = (index: number) => {
    onPostPreviewPress(index);
  };

  const handleUnfollowPress = (profileId: string) => {
    unfollowProfile(profileId);
  };

  const handleFollowPress = (targetProfile: ProfileDetailsType) => {
    followProfile(targetProfile.public_id, { isPrivate: targetProfile.is_private });
  };

  const handleFollowersPress = () => {
    // only enabled for logged in user on profile screen
    if (profileId === authProfile.public_id) {
      router.push("/(app)/posts/followers");
    }
  };

  const handleFollowingPress = () => {
    // only enabled for logged in user on profile screen
    if (profileId === authProfile.public_id) {
      router.push("/(app)/posts/following");
    }
  };

  const handleRemoveFollowerPress = () => {
    removeFollower(profileId);
    confirmRemoveFollowerSheetRef.current?.dismiss();
  };

  const handleRefresh = () => {
    profile.refetch();
    posts.refetch();
  };

  const handleEndReached = () => {
    const hasErrors = posts.isError || posts.isFetchNextPageError;
    const isLoading = posts.isLoading || posts.isFetchingNextPage;

    if (posts.hasNextPage && !hasErrors && !isLoading) {
      posts.fetchNextPage();
    }
  };

  return (
    <>
      <FlashList
        showsVerticalScrollIndicator={false}
        data={dataToRender}
        numColumns={3}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        onEndReached={handleEndReached}
        ListHeaderComponentStyle={{
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[300],
          borderStyle: "solid",
        }}
        ListEmptyComponent={
          <EmptyComponent
            canViewPosts={profile.data?.can_view_posts}
            profileId={profileId}
            postsIsError={posts.isError}
            postsIsLoading={posts.isLoading}
            postsIsRefetching={posts.isRefetching}
            error={posts.error}
          />
        }
        ListFooterComponent={
          <LoadingRetryFooter
            isLoading={posts.isFetchingNextPage}
            isError={posts.isFetchNextPageError}
            fetchNextPage={posts.fetchNextPage}
            message="Oh no! There was an error fetching more posts!"
          />
        }
        ListHeaderComponent={
          <ProfileDetailsHeader
            profileData={profile.data!}
            postsCount={profile.data?.posts_count!}
            handleFollowersPress={handleFollowersPress}
            handleFollowingPress={handleFollowingPress}
            handleUnfollowPress={handleUnfollowPress}
            handleFollowPress={handleFollowPress}
            profileLoading={profile.isLoading}
            profileError={profile.isLoadingError}
            handleTaggedPostsPress={onTaggedPostsPress}
          />
        }
        renderItem={({ item, index }) => {
          return <PostTile post={item} index={index} onPress={() => handlePostPreviewPress(index)} />;
        }}
        refreshControl={
          <RefreshControl
            refreshing={profile.isRefetching || posts.isRefetching}
            onRefresh={handleRefresh}
            tintColor={COLORS.zinc[400]}
            colors={[COLORS.zinc[400]]}
          />
        }
      />
      <ConfirmRemoveFollowerSheet
        confirmRemoveFollowerSheetRef={confirmRemoveFollowerSheetRef}
        onRemoveFollowerPress={handleRemoveFollowerPress}
      />
      {/* Own profile options (saved posts) */}
      <BottomSheetModal handleTitle="Options" ref={optionsModalRef} enableDynamicSizing={true} snapPoints={[]}>
        <BottomSheetView style={s.bottomSheetView}>
          <View
            style={{
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[50],
            }}
          >
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.5 }]}
              onPress={() => {
                router.push("/posts/savedPosts");
                optionsModalRef.current?.dismiss();
              }}
            >
              <View style={s.optionButton}>
                <FontAwesome name="bookmark" size={18} color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[800]} />
                <Text style={{ fontSize: 18 }}>View Saved Posts</Text>
              </View>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      {/* Other profile options (remove follower + report) */}
      <BottomSheetModal handleTitle="Options" ref={profileOptionsModalRef} enableDynamicSizing={true} snapPoints={[]}>
        <BottomSheetView style={s.bottomSheetView}>
          <View
            style={{
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[50],
            }}
          >
            {profile.data?.follows_you && (
              <>
                <Pressable
                  style={({ pressed }) => [pressed && { opacity: 0.5 }]}
                  onPress={() => {
                    profileOptionsModalRef.current?.dismiss();
                    setTimeout(() => {
                      confirmRemoveFollowerSheetRef.current?.present();
                    }, 300);
                  }}
                >
                  <View style={s.optionButton}>
                    <MaterialIcons
                      name="person-remove"
                      size={18}
                      color={isDarkMode ? COLORS.zinc[200] : COLORS.zinc[800]}
                    />
                    <Text style={{ fontSize: 18 }}>Remove Follower</Text>
                  </View>
                </Pressable>
                <View style={{ height: 1, backgroundColor: isDarkMode ? COLORS.zinc[700] : COLORS.zinc[200] }} />
              </>
            )}
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.5 }]}
              onPress={() => {
                profileOptionsModalRef.current?.dismiss();
                setTimeout(() => {
                  reportProfileModalRef.current?.present();
                }, 300);
              }}
            >
              <View style={s.optionButton}>
                <MaterialIcons name="flag" size={18} color={COLORS.red[500]} />
                <Text style={{ fontSize: 18, color: COLORS.red[500] }}>Report Profile</Text>
              </View>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      {profile.data && !isOwnProfile && <ReportProfileModal ref={reportProfileModalRef} profileId={profile.data.id} />}
    </>
  );
};

export default ProfileDetails;

const s = StyleSheet.create({
  optionButton: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  bottomSheetView: {
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 36,
  },
});
