import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { axiosFetch } from "@/api/config";
import { getSavedPosts } from "@/api/post";
import { PaginatedSavedPostsResponse, PostDetailed } from "@/types";
import {
  likePostInState,
  unlikePostInState,
  savePostInState,
  unSavePostInState,
  addCommentInState,
} from "@/utils/utils";

import { useAuthProfileContext } from "./AuthProfileContext";
import { useExplorePostsContext } from "./ExplorePostsContext";
import { useFeedPostsContext } from "./FeedPostsContext";

type SavedPostsContextType = {
  data: PostDetailed[];
  loading: boolean;
  savePost: (data: PostDetailed) => void;
  unSavePost: (id: number) => void;
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
  onLike: (postId: number) => void;
  onUnlike: (postId: number) => void;
  onComment: (postId: number) => void;
};

const SavedPostsContext = createContext<SavedPostsContextType>({
  data: [],
  loading: false,
  savePost: (data: PostDetailed) => {},
  unSavePost: (id: number) => {},
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
  onLike: (postId: number) => {},
  onUnlike: (postId: number) => {},
  onComment: (postId: number) => {},
});

type Props = {
  children: React.ReactNode;
};

const SavedPostsContextProvider = ({ children }: Props) => {
  const { authProfile } = useAuthProfileContext();
  const { setExplorePosts, setSimilarPosts } = useExplorePostsContext();
  const { setData: setFeedPosts } = useFeedPostsContext();

  const [data, setData] = useState<PostDetailed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedPosts = useCallback(async () => {
    if (authProfile?.id) {
      setLoading(true);
      setError("");
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { error, data } = await getSavedPosts();
      if (!error && data) {
        setData(data.results);
        setFetchNextUrl(data.next);
      } else {
        setError("There was an error fetching your saved posts. Please try again.");
        setHasInitialFetchError(true);
      }
      setInitialFetchComplete(true);
    }
  }, [authProfile]);

  useEffect(() => {
    fetchSavedPosts();
  }, [authProfile, fetchSavedPosts]);

  // refresh posts if user swipes down
  const refreshPosts = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchSavedPosts();
    setRefreshing(false);
  };

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl && !refreshing) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data } = await axiosFetch<PaginatedSavedPostsResponse>(fetchNextUrl);
      if (!error && data) {
        setData((prev) => [...prev, ...data.results]);
        setFetchNextUrl(data.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl, refreshing]);

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
      setData((prev) => [postData, ...prev]);
    }
    savePostInState(setExplorePosts, postData.id);
    savePostInState(setFeedPosts, postData.id);
    savePostInState(setSimilarPosts, postData.id);
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
    unSavePostInState(setExplorePosts, id);
    unSavePostInState(setFeedPosts, id);
    unSavePostInState(setSimilarPosts, id);
  };

  const onLike = (postId: number) => {
    likePostInState(setData, postId);
    likePostInState(setExplorePosts, postId);
    likePostInState(setSimilarPosts, postId);
    likePostInState(setFeedPosts, postId);
  };

  const onUnlike = (postId: number) => {
    unlikePostInState(setData, postId);
    unlikePostInState(setExplorePosts, postId);
    unlikePostInState(setSimilarPosts, postId);
    unlikePostInState(setFeedPosts, postId);
  };

  const onComment = (postId: number) => {
    addCommentInState(setData, postId);
    addCommentInState(setExplorePosts, postId);
    addCommentInState(setSimilarPosts, postId);
    addCommentInState(setFeedPosts, postId);
  };

  const value = {
    data,
    loading,
    savePost,
    unSavePost,
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
    onLike,
    onUnlike,
    onComment,
  };

  return <SavedPostsContext.Provider value={value}>{children}</SavedPostsContext.Provider>;
};

export default SavedPostsContextProvider;

export const useSavedPostsContext = () => {
  const {
    data,
    loading,
    savePost,
    unSavePost,
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
    onLike,
    onUnlike,
    onComment,
  } = useContext(SavedPostsContext);
  return {
    data,
    loading,
    savePost,
    unSavePost,
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
    onLike,
    onUnlike,
    onComment,
  };
};
