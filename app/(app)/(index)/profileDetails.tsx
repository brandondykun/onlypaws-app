import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";
import { useProfileDetailsContext } from "@/context/ProfileDetailsContext";

const ProfileDetailsScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/(index)/profileList", params: { initialIndex: index } });
  };

  const { posts, profile } = useProfileDetailsContext();

  return (
    <ProfileDetails
      profileId={profileId}
      onPostPreviewPress={handlePostPreviewPress}
      profileData={profile.data}
      profileLoading={profile.loading}
      profileError={profile.error}
      profileRefresh={profile.refetch}
      profileRefreshing={profile.refreshing}
      postsLoading={!posts.initialFetchComplete}
      postsError={posts.hasInitialFetchError}
      postsData={posts.data}
      postsRefresh={posts.refetch}
      postsRefreshing={posts.refreshing}
      setProfileData={profile.setData}
      fetchNext={posts.fetchNext}
      fetchNextLoading={posts.initialFetchComplete && posts.fetchNextLoading}
      hasFetchNextError={posts.hasFetchNextError}
    />
  );
};

export default ProfileDetailsScreen;
