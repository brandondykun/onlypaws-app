import * as Haptics from "expo-haptics";
import { debounce, DebouncedFunc } from "lodash";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { axiosFetch } from "@/api/config";
import { getFollowing, searchFollowing } from "@/api/profile";
import { FollowProfile, PaginatedProfileResponse } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";

// Context for displaying and searching profiles that the auth profile is following.
// Shares state between following screen and _layout screen to manage the text in the header text input.
// Also needed to share search function for performing search.

type AuthProfileFollowingContextType = {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  data: FollowProfile[];
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
  refreshing: boolean;
  setData: React.Dispatch<React.SetStateAction<FollowProfile[]>>;
  fetchNext: () => Promise<void>;
  fetchNextUrl: string | null;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  fetchSearchNext: () => Promise<void>;
  searchLoading: boolean;
  searchFetchNextLoading: boolean;
  hasSearchFetchNextError: boolean;
  searchResults: FollowProfile[] | null;
  debounceSearch: DebouncedFunc<(text: string) => Promise<void>>;
  setSearchResults: React.Dispatch<React.SetStateAction<FollowProfile[] | null>>;
  searchProfiles: () => Promise<void>;
  hasSearchError: boolean;
};

const AuthProfileFollowingContext = createContext<AuthProfileFollowingContextType>({
  searchText: "",
  setSearchText: () => {},
  data: [],
  loading: false,
  error: false,
  refetch: () => Promise.resolve(),
  refreshing: false,
  setData: () => {},
  fetchNext: () => Promise.resolve(),
  fetchNextUrl: null,
  fetchNextLoading: false,
  hasFetchNextError: false,
  initialFetchComplete: false,
  hasInitialFetchError: false,
  fetchSearchNext: () => Promise.resolve(),
  searchLoading: false,
  searchFetchNextLoading: false,
  hasSearchFetchNextError: false,
  searchResults: null,
  debounceSearch: debounce((text: string) => Promise.resolve()),
  setSearchResults: () => {},
  searchProfiles: () => Promise.resolve(),
  hasSearchError: false,
});

type Props = {
  children: React.ReactNode;
};

const AuthProfileFollowingContextProvider = ({ children }: Props) => {
  const { authProfile } = useAuthProfileContext();

  const [data, setData] = useState<FollowProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearchError, setHasSearchError] = useState(false);
  const [searchFetchNextUrl, setSearchFetchNextUrl] = useState<string | null>(null);
  const [searchFetchNextLoading, setSearchFetchNextLoading] = useState(false);
  const [hasSearchFetchNextError, setHasSearchFetchNextError] = useState(false);
  const [searchResults, setSearchResults] = useState<FollowProfile[] | null>(null);

  const fetchFollowing = useCallback(async () => {
    if (authProfile.id) {
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { data: feedData, error } = await getFollowing(authProfile.id);
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

  useEffect(() => {
    setFetchNextUrl(null);
    fetchFollowing();
  }, [fetchFollowing, authProfile]);

  // refresh following fetch if user swipes down
  const refreshFollowing = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchFollowing();
    setRefreshing(false);
  };

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data: fetchNextData } = await axiosFetch<PaginatedProfileResponse>(fetchNextUrl);
      if (!error && fetchNextData) {
        setData((prev) => [...prev, ...fetchNextData.results]);
        setFetchNextUrl(fetchNextData.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl]);

  const fetchSearchNext = useCallback(async () => {
    if (searchFetchNextUrl) {
      setSearchFetchNextLoading(true);
      setHasSearchFetchNextError(false);
      const { error, data: fetchNextData } = await axiosFetch<PaginatedProfileResponse>(searchFetchNextUrl);
      if (!error && fetchNextData) {
        setSearchResults((prev) => [...prev!, ...fetchNextData.results]);
        setSearchFetchNextUrl(fetchNextData.next);
      } else {
        setHasSearchFetchNextError(true);
      }
      setSearchFetchNextLoading(false);
    }
  }, [searchFetchNextUrl]);

  const debounceSearch = useMemo(
    () =>
      debounce(async (text: string) => {
        if (text) {
          setSearchLoading(true);
          const { error, data } = await searchFollowing(authProfile.id, text);
          if (!error && data) {
            setSearchResults(data.results);
            setSearchFetchNextUrl(data.next);
          }
          setSearchLoading(false);
        }
      }, 1000),
    [authProfile.id],
  );

  const searchProfiles = async () => {
    if (searchText) {
      setSearchLoading(true);
      setHasSearchError(false);
      const { error, data } = await searchFollowing(authProfile.id, searchText);
      if (!error && data) {
        setSearchResults(data.results);
        setSearchFetchNextUrl(data.next);
      } else {
        setHasSearchError(true);
      }

      setSearchLoading(false);
    }
  };

  const value = {
    searchText,
    setSearchText,
    data,
    loading: !initialFetchComplete,
    error: hasInitialFetchError,
    refetch: refreshFollowing,
    refreshing,
    setData,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    initialFetchComplete,
    hasInitialFetchError,
    fetchSearchNext,
    searchLoading,
    searchFetchNextLoading,
    hasSearchFetchNextError,
    searchResults,
    debounceSearch,
    setSearchResults,
    searchProfiles,
    hasSearchError,
  };

  return <AuthProfileFollowingContext.Provider value={value}>{children}</AuthProfileFollowingContext.Provider>;
};

export default AuthProfileFollowingContextProvider;

export const useAuthProfileFollowingContext = () => {
  const {
    searchText,
    setSearchText,
    data,
    loading,
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
    fetchSearchNext,
    searchLoading,
    searchFetchNextLoading,
    hasSearchFetchNextError,
    searchResults,
    debounceSearch,
    setSearchResults,
    searchProfiles,
    hasSearchError,
  } = useContext(AuthProfileFollowingContext);
  return {
    searchText,
    setSearchText,
    data,
    loading,
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
    fetchSearchNext,
    searchLoading,
    searchFetchNextLoading,
    hasSearchFetchNextError,
    searchResults,
    debounceSearch,
    setSearchResults,
    searchProfiles,
    hasSearchError,
  };
};
