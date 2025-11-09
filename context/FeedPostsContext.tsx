import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext } from "react";

import { getFeed } from "@/api/post";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { PostDetailed } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";

type FeedPostsContextType = {
  data: PostDetailed[];
  setData: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  fetchNext: () => Promise<void>;
  fetchNextUrl: string | null;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
};

const FeedPostsContext = createContext<FeedPostsContextType>({
  data: [],
  setData: () => {},
  initialFetchComplete: false,
  hasInitialFetchError: false,
  fetchNext: () => Promise.resolve(),
  fetchNextUrl: null,
  fetchNextLoading: false,
  hasFetchNextError: false,
  refresh: () => Promise.resolve(),
  refreshing: false,
});

type Props = {
  children: React.ReactNode;
};

const FeedPostsContextProvider = ({ children }: Props) => {
  const { authProfile } = useAuthProfileContext();
  const initialFetch = useCallback(async () => {
    const { data, error } = await getFeed();
    return { data, error };
  }, [authProfile.id, authProfile.following_count]); // Will auto refresh when profiles are followed/unfollowed

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
    enabled: !!authProfile.id,
  });

  const value = {
    data,
    setData,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refresh,
    refreshing,
  };

  return <FeedPostsContext.Provider value={value}>{children}</FeedPostsContext.Provider>;
};

export default FeedPostsContextProvider;

export const useFeedPostsContext = () => {
  const {
    data,
    setData,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refresh,
    refreshing,
  } = useContext(FeedPostsContext);
  return {
    data,
    setData,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refresh,
    refreshing,
  };
};
