import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/Colors";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useColorMode } from "@/context/ColorModeContext";
import { ProfileDetails } from "@/types";
import { abbreviateNumber } from "@/utils/utils";

import Button from "../Button/Button";
import ProfileDetailsHeaderSkeleton from "../LoadingSkeletons/ProfileDetailsHeaderSkeleton";
import ProfileDetailsHeaderImage from "../ProfileDetailsHeaderImage/ProfileDetailsHeaderImage";
import Text from "../Text/Text";

type Props = {
  profileData: ProfileDetails;
  postsCount: number;
  handleFollowersPress: () => void;
  handleFollowingPress: () => void;
  handleFollowPress: (profile: ProfileDetails) => void;
  handleUnfollowPress: (profileId: number) => void;
  profileLoading: boolean;
  followLoading?: boolean;
  profileError: boolean;
};

const ProfileDetailsHeader = ({
  profileData,
  postsCount,
  handleFollowersPress,
  handleFollowingPress,
  handleUnfollowPress,
  handleFollowPress,
  profileLoading,
  followLoading,
  profileError,
}: Props) => {
  const { setLightOrDark } = useColorMode();
  const { authProfile } = useAuthProfileContext();

  const router = useRouter();

  if (profileError) return <ProfileErrorMessage />;
  if (profileLoading) return <ProfileDetailsHeaderSkeleton showTwoButtons={authProfile.id === profileData?.id} />;

  const followButtons = (
    <View style={{ flex: 1 }}>
      {profileData && profileData?.is_following && profileData?.id !== authProfile.id ? (
        <Button
          text="Unfollow"
          textStyle={[s.followButtonText, { color: setLightOrDark(COLORS.sky[600], COLORS.sky[500]) }]}
          buttonStyle={[
            s.headerButton,
            {
              borderColor: setLightOrDark(COLORS.sky[600], COLORS.sky[700]),
              backgroundColor: `${COLORS.sky[500]}1A`,
            },
          ]}
          variant="outline"
          onPress={() => handleUnfollowPress(profileData.id)}
          loading={followLoading}
          loadingIconSize={12}
          loadingIconScale={0.7}
        />
      ) : profileData && profileData?.id !== authProfile.id ? (
        <Button
          text="Follow"
          textStyle={s.followButtonText}
          buttonStyle={[s.headerButton, { backgroundColor: COLORS.sky[500] }]}
          onPress={() => handleFollowPress(profileData)}
          loading={followLoading}
          loadingIconSize={12}
          loadingIconScale={0.7}
        />
      ) : null}
    </View>
  );

  const selfProfileButtons = (
    <>
      <View style={{ flex: 1 }}>
        <Button
          text="Saved Posts"
          textStyle={[s.profileButtonText, { color: setLightOrDark(COLORS.zinc[800], COLORS.zinc[50]) }]}
          buttonStyle={[s.headerButton, { backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
          onPress={() => router.push("/(app)/posts/savedPosts")}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Button
          text="Edit Profile"
          textStyle={[s.profileButtonText, { color: setLightOrDark(COLORS.zinc[800], COLORS.zinc[50]) }]}
          buttonStyle={[s.headerButton, { backgroundColor: setLightOrDark(COLORS.zinc[300], COLORS.zinc[800]) }]}
          onPress={() => router.push("/(app)/profile/editProfile")}
        />
      </View>
    </>
  );

  // Create a string of 'pet type • breed'
  const toJoin = [];
  if (profileData?.pet_type) toJoin.push(profileData?.pet_type.name);
  if (profileData?.breed) toJoin.push(profileData.breed);
  const petDetailsText = toJoin.join(" • ");

  return (
    <View>
      <View style={s.profileInfoContainer}>
        <View style={s.profileImageContainer}>
          <ProfileDetailsHeaderImage size={125} image={profileData?.image || null} />
        </View>
        {profileData?.name && <Text style={s.nameText}>{profileData?.name}</Text>}
        {profileData?.about && (
          <Text style={s.aboutText} darkColor={COLORS.zinc[400]} lightColor={COLORS.zinc[700]}>
            {profileData.about}
          </Text>
        )}
        {petDetailsText && (
          <Text style={s.petDetailsText} darkColor={COLORS.zinc[500]} lightColor={COLORS.zinc[500]}>
            {petDetailsText}
          </Text>
        )}
        <View style={s.profileButtonsRoot}>
          {profileData && profileData.id !== authProfile.id ? followButtons : selfProfileButtons}
        </View>
      </View>
      <View style={s.profileNumbersSection}>
        <View style={s.profileNumberGroup}>
          <Text style={s.profileNumber}>{abbreviateNumber(postsCount)}</Text>
          <Text style={s.profileNumberLabel}>POSTS</Text>
        </View>
        <Pressable
          onPress={handleFollowersPress}
          style={({ pressed }) => [pressed && authProfile.id === profileData.id && { opacity: 0.6 }, { flex: 1 }]}
          android_disableSound={profileData?.id !== authProfile.id ? true : false}
        >
          <View style={s.profileNumberGroup}>
            <Text style={s.profileNumber}>{abbreviateNumber(profileData?.followers_count)}</Text>
            <Text style={s.profileNumberLabel}>FOLLOWERS</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={handleFollowingPress}
          style={({ pressed }) => [pressed && authProfile.id === profileData.id && { opacity: 0.6 }, { flex: 1 }]}
          android_disableSound={profileData?.id !== authProfile.id ? true : false}
        >
          <View style={s.profileNumberGroup}>
            <Text style={s.profileNumber}>{abbreviateNumber(profileData?.following_count)}</Text>
            <Text style={s.profileNumberLabel}>FOLLOWING</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default ProfileDetailsHeader;

const ProfileErrorMessage = () => {
  const { isDarkMode } = useColorMode();

  return (
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
      <Text style={{ fontSize: 19, fontWeight: "400" }}>Error loading profile details</Text>
      <Text darkColor={COLORS.zinc[300]} lightColor={COLORS.zinc[800]} style={{ fontSize: 16, fontWeight: "300" }}>
        Swipe down to refresh
      </Text>
      <Entypo name="chevron-thin-down" size={20} color={isDarkMode ? COLORS.zinc[500] : COLORS.zinc[500]} />
    </View>
  );
};

const s = StyleSheet.create({
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  profileNumbersSection: {
    flexDirection: "row",
    paddingBottom: 12,
  },
  profileNumberGroup: {
    gap: 4,
    flex: 1,
    alignItems: "center",
  },
  profileNumber: {
    fontSize: 20,
    fontWeight: "600",
  },
  profileNumberLabel: {
    fontSize: 13,
    color: COLORS.zinc[500],
  },
  profileButtonsRoot: {
    flexDirection: "row",
    paddingBottom: 24,
    gap: 12,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerButton: {
    paddingHorizontal: 0,
    height: 36,
    borderRadius: 8,
    marginTop: 2,
  },
  followButtonText: {
    fontSize: 16,
    color: COLORS.zinc[50],
    fontWeight: "600",
  },
  aboutText: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  petDetailsText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    paddingBottom: 24,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});
