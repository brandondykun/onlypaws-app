import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";

import { axiosFetch } from "@/api/config";
import { getProfilePosts } from "@/api/post";
import ProfileDetails from "@/components/ProfileDetails/ProfileDetails";
import { useExplorePostsContext } from "@/context/ExplorePostsContext";
import { useProfileSearchContext } from "@/context/ProfileSearchContext";
import useProfileDetails from "@/hooks/useProfileDetails";
import { PaginatedProfilePostsResponse } from "@/types";

const ExploreProfileScreen = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const router = useRouter();
  const profile = useProfileDetails(profileId);
  const search = useProfileSearchContext();

  const { selectedProfilePosts, setSelectedProfilePosts } = useExplorePostsContext();

  const [initialFetchLoading, setInitialFetchLoading] = useState(false);
  // const [refreshing, setRefreshing] = useState(false);
  const [initialFetchError, setInitialFetchError] = useState("");
  const [profilePostsNextUrl, setProfilePostsNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handlePostPreviewPress = (index: number) => {
    router.push({ pathname: "/(app)/explore/profileList", params: { initialIndex: index } });
  };

  const fetchPosts = useCallback(async () => {
    if (profileId) {
      setInitialFetchLoading(true);
      setInitialFetchError("");
      const { error, data } = await getProfilePosts(profileId);
      if (!error && data) {
        setSelectedProfilePosts(data.results);
        setProfilePostsNextUrl(data.next);
      } else {
        setInitialFetchError("There was an error fetching those posts. Please try again.");
      }
      setInitialFetchLoading(false);
    }
  }, [profileId, setSelectedProfilePosts]);

  useEffect(() => {
    fetchPosts();
  }, [profileId, fetchPosts]);

  // refresh posts if user swipes down
  const refreshPosts = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchPosts();
    setRefreshing(false);
  };

  const fetchNext = useCallback(async () => {
    if (profilePostsNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data } = await axiosFetch<PaginatedProfilePostsResponse>(profilePostsNextUrl);
      if (!error && data) {
        setSelectedProfilePosts((prev) => [...prev, ...data.results]);
        setProfilePostsNextUrl(data.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [profilePostsNextUrl, setSelectedProfilePosts]);

  return (
    <ProfileDetails
      profileId={profileId}
      onPostPreviewPress={handlePostPreviewPress}
      profileData={profile.data}
      profileLoading={profile.loading}
      profileRefresh={profile.refetch}
      profileRefreshing={profile.refreshing}
      profileError={profile.error}
      postsLoading={initialFetchLoading}
      postsError={!!initialFetchError}
      postsData={selectedProfilePosts}
      postsRefresh={refreshPosts}
      postsRefreshing={refreshing}
      setProfileData={profile.setData}
      fetchNext={fetchNext}
      fetchNextLoading={fetchNextLoading}
      hasFetchNextError={hasFetchNextError}
      onFollow={search.onFollow}
      onUnfollow={search.onUnfollow}
    />
  );
};

export default ExploreProfileScreen;
