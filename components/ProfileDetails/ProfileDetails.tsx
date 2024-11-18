import { router, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import Toast from "react-native-toast-message";

import { unfollowProfile, followProfile } from "@/api/profile";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileDetails as ProfileDetailsType, PostDetailed } from "@/types";

import Button from "../Button/Button";
import PostTile from "../PostTile/PostTile";
import ProfileDetailsHeader from "../ProfileDetailsHeader/ProfileDetailsHeader";

type Props = {
  profileId: number | string;
  onPostPreviewPress: (index: number) => void;
  profileData: ProfileDetailsType | null;
  profileLoading: boolean;
  profileRefresh: () => Promise<void>;
  profileRefreshing: boolean;
  profileError: string;
  postsLoading: boolean;
  postsError: boolean;
  postsData: PostDetailed[] | null;
  setProfileData?: React.Dispatch<React.SetStateAction<ProfileDetailsType | null>>;
  postsRefresh: () => Promise<void>;
  postsRefreshing: boolean;
  fetchNext: () => Promise<void>;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  onFollow?: (profileId: number) => void;
  onUnfollow?: (profileId: number) => void;
};

const ProfileDetails = ({
  profileId,
  onPostPreviewPress,
  profileData,
  profileLoading,
  profileRefresh,
  profileRefreshing,
  profileError,
  postsLoading,
  postsError,
  postsData,
  setProfileData,
  postsRefresh,
  postsRefreshing,
  fetchNext,
  fetchNextLoading,
  hasFetchNextError,
  onFollow,
  onUnfollow,
}: Props) => {
  const navigation = useNavigation();
  const { isDarkMode } = useColorMode();

  const { authProfile, addFollowing, removeFollowing } = useAuthProfileContext();
  const [followLoading, setFollowLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: profileData ? profileData.username : "",
    });
  }, [profileData, navigation]);

  const handlePostPreviewPress = (index: number) => {
    onPostPreviewPress(index);
  };

  const handleUnfollowPress = async (profileId: number) => {
    if (setProfileData) {
      setFollowLoading(true);
      const { error } = await unfollowProfile(profileId, authProfile.id);
      if (!error) {
        setProfileData((prev) => {
          if (prev) {
            return { ...prev, is_following: false, followers_count: prev.followers_count - 1 };
          }
          return prev;
        });
        removeFollowing();
        onUnfollow && onUnfollow(profileId);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error unfollowing that account.",
        });
      }
      setFollowLoading(false);
    }
  };

  const handleFollowPress = async (profile: ProfileDetailsType) => {
    if (setProfileData) {
      setFollowLoading(true);
      const { error, data } = await followProfile(profile.id, authProfile.id);
      if (!error && data) {
        setProfileData((prev) => {
          if (prev) {
            return { ...prev, is_following: true, followers_count: prev.followers_count + 1 };
          }
          return prev;
        });
        addFollowing();
        onFollow && onFollow(profile.id);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error following that account.",
        });
      }
      setFollowLoading(false);
    }
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
    profileRefresh();
    postsRefresh();
  };

  const emptyComponent =
    postsLoading || postsRefreshing ? (
      <View style={{ justifyContent: "center", alignItems: "center", marginTop: 48 }}>
        <ActivityIndicator color={COLORS.zinc[500]} size="small" />
      </View>
    ) : (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            paddingHorizontal: 36,
            fontWeight: "300",
          }}
          darkColor={COLORS.zinc[400]}
          lightColor={COLORS.zinc[600]}
        >
          {authProfile.id === profileId
            ? "You don't have any posts yet! Add a post to see it here."
            : "No posts to see yet."}
        </Text>
      </View>
    );

  // content to be displayed in the footer
  const footerComponent = fetchNextLoading ? (
    <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 16 }}>
      <ActivityIndicator color={COLORS.zinc[500]} size="small" />
    </View>
  ) : hasFetchNextError ? (
    <View style={{ paddingVertical: 48, alignItems: "center", paddingHorizontal: 24 }}>
      <Text style={{ color: COLORS.red[600], textAlign: "center" }}>
        Oh no! There was an error fetching more posts.
      </Text>
      <Button text="Retry" variant="text" onPress={() => fetchNext()} />
    </View>
  ) : null;

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={postsLoading || postsRefreshing ? [] : postsData}
      numColumns={3}
      columnWrapperStyle={{ gap: 2 }}
      ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.1} // Trigger when 10% from the bottom
      onEndReached={!fetchNextLoading ? () => fetchNext() : null}
      ListEmptyComponent={emptyComponent}
      contentContainerStyle={{ flexGrow: 1 }}
      ListHeaderComponentStyle={{
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? COLORS.zinc[900] : COLORS.zinc[200],
        borderStyle: "solid",
      }}
      ListFooterComponent={footerComponent}
      ListHeaderComponent={
        <ProfileDetailsHeader
          profileData={profileData!}
          postsCount={profileData?.posts_count!}
          handleFollowersPress={handleFollowersPress}
          handleFollowingPress={handleFollowingPress}
          handleUnfollowPress={handleUnfollowPress}
          handleFollowPress={handleFollowPress}
          profileLoading={profileLoading}
          followLoading={followLoading}
        />
      }
      renderItem={({ item, index }) => {
        return <PostTile post={item} index={index} onPress={() => handlePostPreviewPress(index)} />;
      }}
      refreshControl={
        <RefreshControl
          refreshing={profileRefreshing || postsRefreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.zinc[400]}
          colors={[COLORS.zinc[400]]}
        />
      }
    />
  );
};

export default ProfileDetails;
