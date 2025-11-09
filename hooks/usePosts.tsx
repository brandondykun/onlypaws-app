import * as Haptics from "expo-haptics";
import { useCallback } from "react";

import { getProfilePosts } from "@/api/profile";
import { PostDetailed } from "@/types";

import { usePaginatedFetch } from "./usePaginatedFetch";

const usePosts = (profileId: number | string | null) => {
  const initialFetch = useCallback(async () => {
    if (!profileId) return { data: null, error: null };
    const { data, error } = await getProfilePosts(profileId);
    return { data, error };
  }, [profileId]);

  const {
    data,
    setData,
    refresh,
    refreshing,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
  } = usePaginatedFetch<PostDetailed>(initialFetch, {
    onRefresh: () => Haptics.impactAsync(),
    enabled: !!profileId,
  });

  return {
    data,
    refetch: refresh,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refreshing,
    hasInitialFetchError,
    initialFetchComplete,
  };
};

export default usePosts;
