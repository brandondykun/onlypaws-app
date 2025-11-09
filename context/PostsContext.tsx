import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext } from "react";

import { getProfilePosts } from "@/api/profile";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { PostDetailed } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";

type PostContextType = {
  data: PostDetailed[];
  fetch: () => Promise<void>;
  addPost: (data: PostDetailed) => void;
  deletePost: (id: number) => void;
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
  removeImageFromPost: (postId: number, imageId: number) => void;
  updatePost: (postId: number, data: PostDetailed) => void;
};

const PostsContext = createContext<PostContextType>({
  data: [],
  fetch: () => Promise.resolve(),
  addPost: (data: PostDetailed) => {},
  deletePost: (id: number) => {},
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
  removeImageFromPost: (postId: number, imageId: number) => {},
  updatePost: (postId: number, data: PostDetailed) => {},
});

type Props = {
  children: React.ReactNode;
};

const PostsContextProvider = ({ children }: Props) => {
  const { authProfile, updatePostsCount } = useAuthProfileContext();

  const initialFetch = useCallback(async () => {
    const { data, error } = await getProfilePosts(authProfile.id);
    return { data, error };
  }, [authProfile]);

  const {
    data,
    setData,
    fetchInitial,
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
    enabled: false, // Lazy load - only fetch when posts tab is visited
  });

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

  const removeImageFromPost = (postId: number, imageId: number) => {
    setData((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return { ...post, images: post.images.filter((image) => image.id !== imageId) };
        }
        return post;
      }),
    );
  };

  const updatePost = (postId: number, data: PostDetailed) => {
    setData((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return { ...data };
        }
        return post;
      }),
    );
  };

  const value = {
    data,
    fetch: fetchInitial,
    addPost,
    deletePost,
    refetch: refresh,
    refreshing,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
    addToCommentCount,
    removeImageFromPost,
    updatePost,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export default PostsContextProvider;

export const usePostsContext = () => {
  const {
    data,
    fetch,
    addPost,
    deletePost,
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
    removeImageFromPost,
    updatePost,
  } = useContext(PostsContext);
  return {
    data,
    fetch,
    addPost,
    deletePost,
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
    removeImageFromPost,
    updatePost,
  };
};
