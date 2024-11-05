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
  setData: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  fetchNext: () => Promise<void>;
  fetchNextUrl: string | null;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
};

const PostsContext = createContext<PostContextType>({
  data: [],
  loading: false,
  addPost: (data: PostDetailed) => {},
  deletePost: (id: number) => {},
  error: "",
  refetch: () => Promise.resolve(),
  setData: () => {},
  fetchNext: () => Promise.resolve(),
  fetchNextUrl: null,
  fetchNextLoading: false,
  hasFetchNextError: false,
  initialFetchComplete: false,
  hasInitialFetchError: false,
});

type Props = {
  children: React.ReactNode;
};

const PostsContextProvider = ({ children }: Props) => {
  const { authProfile } = useAuthProfileContext();
  const [data, setData] = useState<PostDetailed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

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

  const addPost = (data: PostDetailed) => {
    setData((prev) => [data, ...prev]);
  };

  const deletePost = async (id: number) => {
    setData((prev) => {
      return prev.filter((post) => {
        return post.id !== id;
      });
    });
  };

  const value = {
    data,
    loading,
    addPost,
    deletePost,
    error,
    refetch: fetchPosts,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
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
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
  } = useContext(PostsContext);
  return {
    data,
    loading,
    addPost,
    deletePost,
    error,
    refetch,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
  };
};
