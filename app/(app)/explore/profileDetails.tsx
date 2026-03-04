import { useLocalSearchParams, useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";

const ExploreProfileScreen = () => {
  const { profileId, username } = useLocalSearchParams<{ profileId: string; username?: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/explore/profilePostsList", params: { initialIndex: index, profileId } });
  };

  const handleTaggedPostsPress = () => {
    router.push({ pathname: "/(app)/explore/taggedPosts", params: { profileId: profileId } });
  };

  const handleFollowersPress = () => {
    // only enabled for logged in user on profile screen
    router.push({ pathname: "/(app)/explore/followers", params: { profileId, username } });
  };

  const handleFollowingPress = () => {
    // only enabled for logged in user on profile screen
    router.push({ pathname: "/(app)/explore/following", params: { profileId, username } });
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

export default ExploreProfileScreen;
