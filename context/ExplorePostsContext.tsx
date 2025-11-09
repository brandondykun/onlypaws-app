import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext, useState } from "react";

import { getExplorePosts } from "@/api/post";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { PostDetailed } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";
type ExplorePostsContextType = {
  explorePosts: PostDetailed[];
  setExplorePosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
  fetchNext: () => Promise<void>;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  fetchNextUrl: string | null;
  similarPosts: PostDetailed[];
  setSimilarPosts: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
};

const ExplorePostsContext = createContext<ExplorePostsContextType>({
  explorePosts: [],
  setExplorePosts: () => {},
  initialFetchComplete: false,
  hasInitialFetchError: false,
  refresh: () => Promise.resolve(),
  refreshing: false,
  fetchNext: () => Promise.resolve(),
  fetchNextLoading: false,
  hasFetchNextError: false,
  fetchNextUrl: null,
  similarPosts: [],
  setSimilarPosts: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ExplorePostsContextProvider = ({ children }: Props) => {
  const { authProfile } = useAuthProfileContext();

  const initialFetch = useCallback(async () => {
    if (!authProfile.id) return { data: null, error: null };
    return await getExplorePosts();
  }, [authProfile.id]);

  const {
    data,
    setData,
    initialFetchComplete,
    hasInitialFetchError,
    refresh,
    refreshing,
    fetchNext,
    fetchNextLoading,
    hasFetchNextError,
    fetchNextUrl,
  } = usePaginatedFetch<PostDetailed>(initialFetch, {
    onRefresh: () => Haptics.impactAsync(),
    enabled: !!authProfile.id,
  });

  const [similarPosts, setSimilarPosts] = useState<PostDetailed[]>([]);

  const value = {
    explorePosts: data || [],
    setExplorePosts: setData,
    initialFetchComplete,
    hasInitialFetchError,
    refresh,
    refreshing,
    fetchNext,
    fetchNextLoading,
    hasFetchNextError,
    fetchNextUrl,
    similarPosts,
    setSimilarPosts,
  };

  return <ExplorePostsContext.Provider value={value}>{children}</ExplorePostsContext.Provider>;
};

export default ExplorePostsContextProvider;

export const useExplorePostsContext = () => {
  const {
    explorePosts,
    setExplorePosts,
    initialFetchComplete,
    hasInitialFetchError,
    refresh,
    refreshing,
    fetchNext,
    fetchNextLoading,
    hasFetchNextError,
    fetchNextUrl,
    similarPosts,
    setSimilarPosts,
  } = useContext(ExplorePostsContext);
  return {
    explorePosts,
    setExplorePosts,
    initialFetchComplete,
    hasInitialFetchError,
    refresh,
    refreshing,
    fetchNext,
    fetchNextLoading,
    hasFetchNextError,
    fetchNextUrl,
    similarPosts,
    setSimilarPosts,
  };
};
