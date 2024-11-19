import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";

import { axiosFetch } from "@/api/config";
import { getProfilePosts } from "@/api/post";
import { PaginatedProfilePostsResponse, PostDetailed } from "@/types";
import { likePostInState, unlikePostInState, addCommentInState } from "@/utils/utils";

const usePosts = (profileId: number | string | null) => {
  const [data, setData] = useState<PostDetailed[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);

  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (profileId) {
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { error, data } = await getProfilePosts(profileId);
      if (!error && data) {
        setData(data.results);
        setFetchNextUrl(data.next);
      } else {
        setHasInitialFetchError(true);
      }
      setInitialFetchComplete(true);
      setRefreshing(false);
    }
  }, [profileId]);

  // refresh posts fetch if user swipes down
  const refreshPosts = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    setInitialFetchComplete(false);
    setFetchNextLoading(false);
    setFetchNextUrl(null);
    fetchPosts();
  }, [fetchPosts, profileId]);

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data } = await axiosFetch<PaginatedProfilePostsResponse>(fetchNextUrl);
      if (!error && data) {
        setData((prev) => [...prev, ...data.results]);
        setFetchNextUrl(data.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl]);

  const addLike = (postId: number) => {
    setData((prev) => {
      if (prev) {
        prev?.map((post) => {
          if (post.id === postId) {
            return { ...post, liked: true, likes_count: post.likes_count + 1 };
          }
          return post;
        });
      }
      return prev;
    });
  };

  const onLike = (postId: number) => {
    likePostInState(setData, postId);
  };

  const onUnlike = (postId: number) => {
    unlikePostInState(setData, postId);
  };

  const onComment = (postId: number) => {
    addCommentInState(setData, postId);
  };

  return {
    data,
    addLike,
    refetch: refreshPosts,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refreshing,
    hasInitialFetchError,
    initialFetchComplete,
    onLike,
    onUnlike,
    onComment,
  };
};

export default usePosts;
