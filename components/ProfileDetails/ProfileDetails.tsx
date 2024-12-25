import { SimpleLineIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomSheetView, BottomSheetModal as RNBottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useRef, useState } from "react";
import { View, ActivityIndicator, RefreshControl, Dimensions, Pressable, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

import { unfollowProfile, followProfile } from "@/api/profile";
import Text from "@/components/Text/Text";
import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileDetails as ProfileDetailsType, PostDetailed } from "@/types";

import BottomSheetModal from "../BottomSheet/BottomSheet";
import Button from "../Button/Button";
import PostTileSkeleton from "../LoadingSkeletons/PostTileSkeleton";
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
  const router = useRouter();
  const { isDarkMode } = useColorMode();
  const screenWidth = Dimensions.get("window").width;
  const tabBarHeight = useBottomTabBarHeight();
  const optionsModalRef = useRef<RNBottomSheetModal>(null);

  const { authProfile, addFollowing, removeFollowing } = useAuthProfileContext();
  const [followLoading, setFollowLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: profileData ? profileData.username : "",
      headerRight: () => (
        <Pressable
          onPress={() => optionsModalRef.current?.present()}
          style={({ pressed }) => [pressed && { opacity: 0.7 }, { paddingLeft: 24, paddingVertical: 8 }]}
          hitSlop={20}
          testID="profile-details-menu-button"
        >
          <SimpleLineIcons name="options" size={18} color={isDarkMode ? COLORS.zinc[300] : COLORS.zinc[900]} />
        </Pressable>
      ),
    });
  }, [profileData, navigation, isDarkMode]);

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
      <PostTileSkeleton />
    ) : (
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
    <>
      <FlashList
        showsVerticalScrollIndicator={false}
        data={postsLoading || postsRefreshing ? [] : postsData}
        numColumns={3}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.1} // Trigger when 10% from the bottom
        onEndReached={!fetchNextLoading ? () => fetchNext() : null}
        ListEmptyComponent={emptyComponent}
        estimatedItemSize={screenWidth / 3}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
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
