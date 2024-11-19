import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { axiosFetch } from "@/api/config";
import { getFeed } from "@/api/profile";
import { PaginatedFeedResponse, PostDetailed, PostCommentDetailed } from "@/types";
import { likePostInState, addCommentInState, unlikePostInState } from "@/utils/utils";

import { useAuthProfileContext } from "./AuthProfileContext";

type FeedPostsContextType = {
  data: PostDetailed[];
  setData: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  refetch: () => Promise<void>;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  fetchNext: () => Promise<void>;
  fetchNextUrl: string | null;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
  onLike: (postId: number) => void;
  onUnlike: (postId: number) => void;
  onComment: (comment: PostCommentDetailed, postId: number) => void;
};

const FeedPostsContext = createContext<FeedPostsContextType>({
  data: [],
  setData: () => {},
  refetch: () => Promise.resolve(),
  initialFetchComplete: false,
  hasInitialFetchError: false,
  fetchNext: () => Promise.resolve(),
  fetchNextUrl: null,
  fetchNextLoading: false,
  hasFetchNextError: false,
  refresh: () => Promise.resolve(),
  refreshing: false,
  onLike: (postId: number) => {},
  onUnlike: (postId: number) => {},
  onComment: (comment: PostCommentDetailed, postId: number) => {},
});

type Props = {
  children: React.ReactNode;
};

const FeedPostsContextProvider = ({ children }: Props) => {
  const [data, setData] = useState<PostDetailed[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  const { authProfile } = useAuthProfileContext();

  const fetchFeed = useCallback(async () => {
    if (authProfile.id) {
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { data: feedData, error } = await getFeed(authProfile.id);
      if (feedData && !error) {
        setData(feedData.results);
        setFetchNextUrl(feedData.next);
      } else {
        setHasInitialFetchError(true);
      }
      setInitialFetchComplete(true);
      setRefreshing(false);
    }
  }, [authProfile]);

  // refresh feed fetch if user swipes down
  const refreshFeed = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchFeed();
    setRefreshing(false);
  };

  useEffect(() => {
    setFetchNextUrl(null);
    fetchFeed();
  }, [fetchFeed, authProfile]);

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data: fetchNextData } = await axiosFetch<PaginatedFeedResponse>(fetchNextUrl);
      if (!error && fetchNextData) {
        setData((prev) => [...prev, ...fetchNextData.results]);
        setFetchNextUrl(fetchNextData.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl]);

  const onLike = (postId: number) => {
    likePostInState(setData, postId);
  };

  const onUnlike = (postId: number) => {
    unlikePostInState(setData, postId);
  };

  const onComment = (comment: PostCommentDetailed, postId: number) => {
    addCommentInState(setData, comment, postId);
  };

  const value = {
    data,
    setData,
    refetch: fetchFeed,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refresh: refreshFeed,
    refreshing,
    onLike,
    onUnlike,
    onComment,
  };

  return <FeedPostsContext.Provider value={value}>{children}</FeedPostsContext.Provider>;
};

export default FeedPostsContextProvider;

export const useFeedPostsContext = () => {
  const {
    data,
    setData,
    refetch,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refresh,
    refreshing,
    onLike,
    onUnlike,
    onComment,
  } = useContext(FeedPostsContext);
  return {
    data,
    setData,
    refetch,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refresh,
    refreshing,
    onLike,
    onUnlike,
    onComment,
  };
};
