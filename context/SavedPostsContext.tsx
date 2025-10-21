import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext } from "react";

import { getSavedPosts } from "@/api/post";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { PostDetailed } from "@/types";

type SavedPostsContextType = {
  fetch: () => Promise<void>;
  data: PostDetailed[];
  savePost: (data: PostDetailed) => void;
  unSavePost: (id: number) => void;
  refetch: () => Promise<void>;
  refreshing: boolean;
  setData: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
  fetchNext: () => Promise<void>;
  fetchNextUrl: string | null;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
};

const SavedPostsContext = createContext<SavedPostsContextType>({
  fetch: () => Promise.resolve(),
  data: [],
  savePost: (data: PostDetailed) => {},
  unSavePost: (id: number) => {},
  refetch: () => Promise.resolve(),
  refreshing: false,
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

const SavedPostsContextProvider = ({ children }: Props) => {
  const initialFetch = useCallback(async () => {
    const { data, error } = await getSavedPosts();
    return { data, error };
  }, []);

  const {
    fetchInitial,
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
    enabled: false, // Lazy load - only fetch when screen is visited
  });

  const savePost = (postData: PostDetailed) => {
    // post might be in data already. If post was unsaved from savedPostsList screen, it is not removed from the list
    // and could be re-saved while still in the list. If that is the case, don't re-add the post to the list,
    // just set is_saved to true for the post
    const savedPostsIds = data.map((post) => post.id);
    if (savedPostsIds.includes(postData.id)) {
      setData((prev) => {
        return prev.map((prevPost) => {
          if (prevPost.id === postData.id) {
            return { ...prevPost, is_saved: true };
          }
          return prevPost;
        });
      });
    } else {
      setData((prev) => [{ ...postData, is_saved: true }, ...prev]);
    }
  };

  const unSavePost = (id: number) => {
    // removing post from data causes abrupt change in ui. Setting is_saved to false keeps
    // the post in place but shows that it is no longer saved
    setData((prev) => {
      return prev.map((prevPost) => {
        if (prevPost.id === id) {
          return { ...prevPost, is_saved: false };
        }
        return prevPost;
      });
    });
  };

  const value = {
    fetch: fetchInitial,
    data,
    savePost,
    unSavePost,
    refetch: refresh,
    refreshing,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
  };

  return <SavedPostsContext.Provider value={value}>{children}</SavedPostsContext.Provider>;
};

export default SavedPostsContextProvider;

export const useSavedPostsContext = () => {
  const {
    fetch,
    data,
    savePost,
    unSavePost,
    refetch,
    refreshing,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
  } = useContext(SavedPostsContext);
  return {
    fetch,
    data,
    savePost,
    unSavePost,
    refetch,
    refreshing,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
  };
};
