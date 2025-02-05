import { useLocalSearchParams, useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";
import { usePostsProfileDetailsContext } from "@/context/PostsProfileDetailsContext";

const PostsProfileDetailsScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const router = useRouter();
  const { posts, profile } = usePostsProfileDetailsContext();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/posts/profilePostsList", params: { initialIndex: index } });
  };

  return (
    <ProfileDetails
      profileId={profileId}
      onPostPreviewPress={handlePostPreviewPress}
      profileData={profile.data}
      profileLoading={profile.loading}
      profileRefresh={profile.refetch}
      profileRefreshing={profile.refreshing}
      profileError={profile.error}
      postsLoading={!posts.initialFetchComplete}
      postsError={!!posts.hasInitialFetchError}
      postsData={posts.data}
      postsRefresh={posts.refetch}
      postsRefreshing={posts.refreshing}
      setProfileData={profile.setData}
      fetchNext={posts.fetchNext}
      fetchNextLoading={posts.fetchNextLoading}
      hasFetchNextError={posts.hasFetchNextError}
    />
  );
};

export default PostsProfileDetailsScreen;
