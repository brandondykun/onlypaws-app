import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";

const ProfileDetailsScreen = () => {
  const { profileId, username } = useLocalSearchParams<{ profileId: string; username?: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/(index)/profilePostsList", params: { initialIndex: index, profileId } });
  };

  const handleTaggedPostsPress = () => {
    router.push({ pathname: "/(app)/(index)/taggedPosts", params: { profileId: profileId } });
  };

  const handleFollowersPress = () => {
    router.push({ pathname: "/(app)/(index)/followers", params: { profileId: profileId, username } });
  };

  const handleFollowingPress = () => {
    router.push({ pathname: "/(app)/(index)/following", params: { profileId: profileId, username } });
  };

  return (
    <ProfileDetails
      username={username}
      profileId={profileId}
      onPostPreviewPress={handlePostPreviewPress}
      onTaggedPostsPress={handleTaggedPostsPress}
      onFollowersPress={handleFollowersPress}
      onFollowingPress={handleFollowingPress}
    />
  );
};

export default ProfileDetailsScreen;
