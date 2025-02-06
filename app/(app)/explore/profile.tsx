import { useLocalSearchParams, useRouter } from "expo-router";

import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";
import { useExploreProfileDetailsContext } from "@/context/ExploreProfileDetailsContext";

const ExploreProfileScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const { profile, posts } = useExploreProfileDetailsContext();

  const router = useRouter();

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/explore/profileList", params: { initialIndex: index } });
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
      postsError={posts.hasInitialFetchError}
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

export default ExploreProfileScreen;
