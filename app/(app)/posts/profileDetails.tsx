import { useLocalSearchParams, useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";

const PostsProfileDetailsScreen = () => {
  const { profileId, username } = useLocalSearchParams<{ profileId: string; username?: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/posts/profilePostsList", params: { initialIndex: index, profileId } });
  };

  const handleTaggedPostsPress = () => {
    router.push({ pathname: "/(app)/posts/taggedPosts", params: { profileId: profileId } });
  };

  const handleFollowersPress = () => {
    // only enabled for logged in user on profile screen
    router.push({ pathname: "/(app)/posts/followers", params: { profileId: profileId, username } });
  };

  const handleFollowingPress = () => {
    // only enabled for logged in user on profile screen
    router.push({ pathname: "/(app)/posts/following", params: { profileId: profileId, username } });
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

export default PostsProfileDetailsScreen;
