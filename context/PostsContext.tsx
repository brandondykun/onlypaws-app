import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { axiosFetch } from "@/api/config";
import { getProfilePosts } from "@/api/post";
import { PaginatedProfilePostsResponse, PostDetailed } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";

type PostContextType = {
  data: PostDetailed[];
  loading: boolean;
  addPost: (data: PostDetailed) => void;
  deletePost: (id: number) => void;
  error: string;
  refetch: () => Promise<void>;
  refreshing: boolean;
  setData: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  fetchNext: () => Promise<void>;
  fetchNextUrl: string | null;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  addToCommentCount: (postId: number) => void;
};

const PostsContext = createContext<PostContextType>({
  data: [],
  loading: false,
  addPost: (data: PostDetailed) => {},
  deletePost: (id: number) => {},
  error: "",
  refetch: () => Promise.resolve(),
  refreshing: false,
  setData: () => {},
  fetchNext: () => Promise.resolve(),
  fetchNextUrl: null,
  fetchNextLoading: false,
  hasFetchNextError: false,
  initialFetchComplete: false,
  hasInitialFetchError: false,
  addToCommentCount: (postId: number) => {},
});

type Props = {
  children: React.ReactNode;
};

const PostsContextProvider = ({ children }: Props) => {
  const { authProfile, updatePostsCount } = useAuthProfileContext();
  const [data, setData] = useState<PostDetailed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (authProfile?.id) {
      setLoading(true);
      setError("");
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { error, data } = await getProfilePosts(authProfile.id);
      if (!error && data) {
        setData(data.results);
        setFetchNextUrl(data.next);
      } else {
        setError("There was an error fetching your posts. Please try again.");
        setHasInitialFetchError(true);
      }
      setInitialFetchComplete(true);
    }
  }, [authProfile]);

  useEffect(() => {
    fetchPosts();
  }, [authProfile, fetchPosts]);

  // refresh posts if user swipes down
  const refreshPosts = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchPosts();
    setRefreshing(false);
  };

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl && !refreshing) {
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
  }, [fetchNextUrl, refreshing]);

  const addPost = (data: PostDetailed) => {
    setData((prev) => [data, ...prev]);
  };

  const deletePost = (id: number) => {
    setData((prev) => {
      return prev.filter((post) => {
        return post.id !== id;
      });
    });
    updatePostsCount("subtract", 1); // update auth profile post count
  };

  const addToCommentCount = (postId: number) => {
    setData((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return { ...post, comments_count: post.comments_count + 1 };
        }
        return post;
      }),
    );
  };

  const value = {
    data,
    loading,
    addPost,
    deletePost,
    error,
    refetch: refreshPosts,
    refreshing,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
    addToCommentCount,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export default PostsContextProvider;

export const usePostsContext = () => {
  const {
    data,
    loading,
    addPost,
    deletePost,
    error,
    refetch,
    refreshing,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
    addToCommentCount,
  } = useContext(PostsContext);
  return {
    data,
    loading,
    addPost,
    deletePost,
    error,
    refetch,
    refreshing,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
    addToCommentCount,
  };
};
