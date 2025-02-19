import { useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { usePostsContext } from "@/context/PostsContext";

const PostsScreen = () => {
  const posts = usePostsContext();
  const { authProfile, refetch, refreshing, loading } = useAuthProfileContext();
  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/posts/list", params: { initialIndex: index } });
  };

  return (
    <ProfileDetails
      profileId={authProfile.id}
      onPostPreviewPress={handlePostPreviewPress}
      profileData={authProfile}
      profileLoading={refreshing || loading}
      profileRefresh={refetch}
      profileRefreshing={refreshing}
      profileError={false}
      postsLoading={false}
      postsError={false}
      postsData={posts.data}
      postsRefresh={posts.refetch}
      postsRefreshing={posts.refreshing}
      setProfileData={undefined}
      fetchNext={posts.fetchNext}
      fetchNextLoading={posts.fetchNextLoading}
      hasFetchNextError={posts.hasFetchNextError}
    />
  );
};

export default PostsScreen;
