import { useLocalSearchParams, useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";

const ProfileDetailsScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/profile/profilePostsList", params: { initialIndex: index, profileId } });
  };

  const handleTaggedPostsPress = () => {
    router.push({ pathname: "/(app)/profile/taggedPosts", params: { profileId: profileId } });
  };

  const handleFollowersPress = () => {
    router.push({ pathname: "/(app)/profile/followers", params: { profileId: profileId } });
  };

  const handleFollowingPress = () => {
    router.push({ pathname: "/(app)/profile/following", params: { profileId: profileId } });
  };

  return (
    <ProfileDetails
      profileId={profileId}
      onPostPreviewPress={handlePostPreviewPress}
      onTaggedPostsPress={handleTaggedPostsPress}
      onFollowersPress={handleFollowersPress}
      onFollowingPress={handleFollowingPress}
    />
  );
};

export default ProfileDetailsScreen;
