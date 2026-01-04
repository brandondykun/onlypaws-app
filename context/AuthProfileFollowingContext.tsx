import * as Haptics from "expo-haptics";
import { debounce, DebouncedFunc } from "lodash";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { axiosFetch } from "@/api/config";
import { getFollowing } from "@/api/interactions";
import { searchFollowing } from "@/api/profile";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { FollowProfile } from "@/types";
import { PaginatedResponse } from "@/types/shared/pagination";

import { useAuthProfileContext } from "./AuthProfileContext";

// Context for displaying and searching profiles that the auth profile is following.
// Shares state between following screen and _layout screen to manage the text in the header text input.
// Also needed to share search function for performing search.

type AuthProfileFollowingContextType = {
  fetch: () => Promise<void>;
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
  fetch: () => Promise.resolve(),
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

  const initialFetch = useCallback(async () => {
    const { data, error } = await getFollowing(authProfile.id);
    return { data, error };
  }, [authProfile]);

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
  } = usePaginatedFetch<FollowProfile>(initialFetch, {
    onRefresh: () => Haptics.impactAsync(),
    enabled: false, // Lazy load - only fetch when following screen is visited
  });

  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearchError, setHasSearchError] = useState(false);
  const [searchFetchNextUrl, setSearchFetchNextUrl] = useState<string | null>(null);
  const [searchFetchNextLoading, setSearchFetchNextLoading] = useState(false);
  const [hasSearchFetchNextError, setHasSearchFetchNextError] = useState(false);
  const [searchResults, setSearchResults] = useState<FollowProfile[] | null>(null);

  const fetchSearchNext = useCallback(async () => {
    if (searchFetchNextUrl) {
      setSearchFetchNextLoading(true);
      setHasSearchFetchNextError(false);
      const { error, data: fetchNextData } = await axiosFetch<PaginatedResponse<FollowProfile>>(searchFetchNextUrl);
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
    fetch: fetchInitial,
    searchText,
    setSearchText,
    data,
    loading: !initialFetchComplete,
    error: hasInitialFetchError,
    refetch: refresh,
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
    fetch,
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
    fetch,
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
