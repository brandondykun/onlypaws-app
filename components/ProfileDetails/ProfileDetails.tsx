import { SimpleLineIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
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
import { useAuthUserContext } from "@/context/AuthUserContext";
import { useColorMode } from "@/context/ColorModeContext";
import { useProfileDetailsManagerContext } from "@/context/ProfileDetailsManagerContext";
import { ProfileDetails as ProfileDetailsType } from "@/types";
import { getNextPageParam, minutesToMilliseconds } from "@/utils/utils";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import LoadingRetryFooter from "../Footer/LoadingRetryFooter/LoadingRetryFooter";
import PostTile from "../PostTile/PostTile";
import ProfileDetailsHeader from "../ProfileDetailsHeader/ProfileDetailsHeader";

import ConfirmRemoveFollowerSheet from "./components/ConfirmRemoveFollowerSheet/ConfirmRemoveFollowerSheet";
import EmptyComponent from "./components/EmptyComponent/EmptyComponent";

type Props = {
  profileId: number | string;
  onPostPreviewPress: (index: number) => void;
  onTaggedPostsPress: () => void;
  username?: string;
};

const ProfileDetails = ({ profileId, onPostPreviewPress, onTaggedPostsPress, username }: Props) => {
  const navigation = useNavigation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const optionsModalRef = useRef<RNBottomSheetModal>(null);
  const confirmRemoveFollowerSheetRef = useRef<RNBottomSheetModal>(null);

  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  const { selectedProfileId } = useAuthUserContext();
  const { followProfile, unfollowProfile, removeFollower } = useProfileDetailsManagerContext();

  const fetchProfile = async (id: number | string) => {
    const res = await getProfileDetailsForQuery(id);
    return res.data;
  };

  const isOwnProfile = profileId.toString() === selectedProfileId?.toString();
  // Use the same query key as AuthProfileContext when viewing own profile
  // This ensures cache updates from the context are reflected here
  const profileQueryKey = [selectedProfileId, "profile", profileId.toString()];

  const profile = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => fetchProfile(profileId),
    staleTime: isOwnProfile ? 0 : minutesToMilliseconds(5),
    enabled: !!selectedProfileId,
  });

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getProfilePostsForQuery(profileId, pageParam);
    return res.data;
  };

  // NOTE: We compare with selectedProfileId directly (not authProfile.id) because authProfile
  // uses placeholderData which can return stale data during profile switches
  const postsQueryKey = [selectedProfileId, "posts", "profile", profileId.toString()];

  const posts = useInfiniteQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    staleTime: isOwnProfile ? 0 : minutesToMilliseconds(5),
    enabled: !!selectedProfileId,
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
        } else if (profile.data?.follows_you) {
          // show if the profile being viewed follows the logged in profile
          return (
            <Pressable
              onPress={handleShowConfirmRemoveFollowerSheet}
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

  const handleShowConfirmRemoveFollowerSheet = () => {
    confirmRemoveFollowerSheetRef.current?.present();
  };

  const handlePostPreviewPress = (index: number) => {
    onPostPreviewPress(index);
  };

  const handleUnfollowPress = (profileId: number) => {
    unfollowProfile(profileId);
  };

  const handleFollowPress = (targetProfile: ProfileDetailsType) => {
    followProfile(targetProfile.id, { isPrivate: targetProfile.is_private });
  };

  const handleFollowersPress = () => {
    // only enabled for logged in user on profile screen
    if (Number(profileId) === authProfile.id) {
      router.push("/(app)/posts/followers");
    }
  };

  const handleFollowingPress = () => {
    // only enabled for logged in user on profile screen
    if (Number(profileId) === authProfile.id) {
      router.push("/(app)/posts/following");
    }
  };

  const handleRemoveFollowerPress = () => {
    removeFollower(Number(profileId));
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
