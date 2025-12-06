import { SimpleLineIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { View, RefreshControl, Pressable, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

import { unfollowProfile, followProfile } from "@/api/interactions";
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
import LoadingFooter from "../LoadingFooter/LoadingFooter";
import PostTileSkeleton from "../LoadingSkeletons/PostTileSkeleton";
import PostTile from "../PostTile/PostTile";
import ProfileDetailsHeader from "../ProfileDetailsHeader/ProfileDetailsHeader";
import RetryFetchFooter from "../RetryFetchFooter/RetryFetchFooter";

type Props = {
  profileId: number | string;
  onPostPreviewPress: (index: number) => void;
  onTaggedPostsPress: () => void;
};

const ProfileDetails = ({ profileId, onPostPreviewPress, onTaggedPostsPress }: Props) => {
  const navigation = useNavigation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const optionsModalRef = useRef<RNBottomSheetModal>(null);

  const { isDarkMode } = useColorMode();
  const { authProfile } = useAuthProfileContext();
  const { selectedProfileId } = useAuthUserContext();
  const profileDetailsManager = useProfileDetailsManagerContext();

  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = async (id: number | string) => {
    const res = await getProfileDetailsForQuery(id);
    return res.data;
  };

  const profile = useQuery({
    queryKey: [selectedProfileId, "profile", profileId.toString()],
    queryFn: () => fetchProfile(profileId),
    staleTime: profileId === authProfile.id ? 0 : minutesToMilliseconds(5),
    enabled: !!selectedProfileId,
  });

  const fetchPosts = async ({ pageParam }: { pageParam: string }) => {
    const res = await getProfilePostsForQuery(profileId, pageParam);
    return res.data;
  };

  // determine the query key based on the profile ID
  // if the logged in user is looking at their own profile, use the authProfile query key
  // if the logged in user is looking at another profile, use the profile query key
  const queryKey =
    profileId === authProfile.id
      ? [selectedProfileId, "posts", "authProfile"]
      : [selectedProfileId, "posts", "profile", profileId.toString()];

  const posts = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: fetchPosts,
    initialPageParam: "1",
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage),
    staleTime: profileId === authProfile.id ? 0 : minutesToMilliseconds(5),
    enabled: !!selectedProfileId,
  });

  // Memoize the flattened posts data
  const dataToRender = useMemo(() => {
    return posts.data?.pages.flatMap((page) => page.results) ?? [];
  }, [posts.data]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: profile.data ? `@${profile.data.username}` : "",
      headerRight: () => {
        if (profile.data?.id === authProfile.id) {
          // only show if user is looking at own profile
          return (
            <Pressable
              onPressOut={() => optionsModalRef.current?.present()}
              style={({ pressed }) => [pressed && { opacity: 0.7 }, { paddingLeft: 24, paddingVertical: 8 }]}
              hitSlop={20}
              testID="profile-details-menu-button"
            >
              <SimpleLineIcons name="options" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />
            </Pressable>
          );
        } else {
          return null;
        }
      },
    });
  }, [profile.data, navigation, isDarkMode, authProfile.id]);

  const handlePostPreviewPress = (index: number) => {
    onPostPreviewPress(index);
  };

  const handleUnfollowPress = async (profileId: number) => {
    setFollowLoading(true);
    const { error } = await unfollowProfile(profileId);
    if (!error) {
      profileDetailsManager.onUnfollow(profileId);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error unfollowing that account.",
      });
    }
    setTimeout(() => {
      setFollowLoading(false);
    }, 100);
  };

  const handleFollowPress = async (profile: ProfileDetailsType) => {
    setFollowLoading(true);
    const { error, data } = await followProfile(profile.id);
    if (!error && data) {
      profileDetailsManager.onFollow(profile.id);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error following that account.",
      });
    }
    setTimeout(() => {
      setFollowLoading(false);
    }, 100);
  };

  const handleFollowersPress = () => {
    // only enabled for logged in user on profile screen
    if (profileId === authProfile.id) {
      router.push("/(app)/posts/followers");
    }
  };

  const handleFollowingPress = () => {
    // only enabled for logged in user on profile screen
    if (profileId === authProfile.id) {
      router.push("/(app)/posts/following");
    }
  };

  const handleRefresh = () => {
    profile.refetch();
    posts.refetch();
  };

  const emptyComponent =
    posts.isLoading || posts.isRefetching ? (
      <PostTileSkeleton />
    ) : !posts.isError ? (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            paddingHorizontal: 36,
            fontWeight: "300",
            paddingTop: 96,
          }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          {authProfile.id === profileId
            ? "You don't have any posts yet! Add a post to see it here."
            : "No posts to see yet."}
        </Text>
      </View>
    ) : (
      <View
        style={{
          backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[50],
          height: 280,
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Ionicons name="alert-circle-outline" size={36} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[700]} />
        <Text style={{ fontSize: 19, fontWeight: "400" }}>Error loading posts</Text>
        <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]} style={{ fontSize: 16, fontWeight: "300" }}>
          Swipe down to refresh
        </Text>
        <Entypo name="chevron-thin-down" size={20} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[500]} />
      </View>
    );

  // content to be displayed in the footer
  const footerComponent = posts.isFetchingNextPage ? (
    <LoadingFooter />
  ) : posts.isFetchNextPageError ? (
    <RetryFetchFooter
      fetchFn={posts.fetchNextPage}
      message="Oh no! There was an error fetching more posts!"
      buttonText="Retry"
    />
  ) : null;

  return (
    <>
      <FlashList
        showsVerticalScrollIndicator={false}
        data={posts.isLoading || posts.isRefetching ? [] : dataToRender}
        numColumns={3}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.3} // Trigger when 30% from the bottom
        onEndReached={
          !posts.isFetchingNextPage && !posts.isLoading && !posts.isError && !posts.isFetchNextPageError
            ? () => posts.fetchNextPage()
            : null
        }
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        ListHeaderComponentStyle={{
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200],
          borderStyle: "solid",
        }}
        ListFooterComponent={footerComponent}
        ListHeaderComponent={
          <ProfileDetailsHeader
            profileData={profile.data!}
            postsCount={profile.data?.posts_count!}
            handleFollowersPress={handleFollowersPress}
            handleFollowingPress={handleFollowingPress}
            handleUnfollowPress={handleUnfollowPress}
            handleFollowPress={handleFollowPress}
            profileLoading={profile.isLoading}
            followLoading={followLoading}
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
      <BottomSheetModal handleTitle="Options" ref={optionsModalRef} enableDynamicSizing={true} snapPoints={[]}>
        <BottomSheetView style={s.bottomSheetView}>
          <View
            style={{
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: isDarkMode ? COLORS.zinc[800] : COLORS.zinc[300],
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
