import React from "react";
import { View, StyleSheet } from "react-native";

import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { ProfileDetails } from "@/types";

import ProfileDetailsHeaderSkeleton from "../LoadingSkeletons/ProfileDetailsHeaderSkeleton";

import About from "./components/About";
import ActionButtons from "./components/ActionButtons";
import ProfileAttributes from "./components/ProfileAttributes";
import ProfileErrorMessage from "./components/ProfileErrorMessage";
import ProfileImageAndStats from "./components/ProfileImageAndStats";

type Props = {
  profileData: ProfileDetails;
  postsCount: number;
  handleFollowersPress: () => void;
  handleFollowingPress: () => void;
  handleFollowPress: (profile: ProfileDetails) => void;
  handleUnfollowPress: (profileId: number) => void;
  handleTaggedPostsPress: () => void;
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
  handleTaggedPostsPress,
  profileLoading,
  followLoading,
  profileError,
}: Props) => {
  const { authProfile } = useAuthProfileContext();

  if (profileError) return <ProfileErrorMessage />;
  if (profileLoading) return <ProfileDetailsHeaderSkeleton />;

  return (
    <View style={s.root}>
      <ProfileImageAndStats
        profileData={profileData}
        postsCount={postsCount}
        handleFollowersPress={handleFollowersPress}
        handleFollowingPress={handleFollowingPress}
      />
      <About aboutText={profileData.about} />
      <ProfileAttributes profileData={profileData} />
      <ActionButtons
        profileData={profileData}
        authProfile={authProfile}
        followLoading={!!followLoading}
        handleUnfollowPress={handleUnfollowPress}
        handleFollowPress={handleFollowPress}
        handleTaggedPostsPress={handleTaggedPostsPress}
      />
    </View>
  );
};

export default ProfileDetailsHeader;

const s = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
});
