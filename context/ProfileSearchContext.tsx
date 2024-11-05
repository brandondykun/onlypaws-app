import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext, useState } from "react";

import { axiosFetch } from "@/api/config";
import { searchProfiles } from "@/api/profile";
import { SearchedProfile, PaginatedSearchedProfileResponse } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";

type ProfileSearchContextType = {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  search: () => Promise<void>;
  data: SearchedProfile[];
  setData: React.Dispatch<React.SetStateAction<SearchedProfile[]>>;
  refetch: () => Promise<void>;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  fetchNext: () => Promise<void>;
  fetchNextUrl: string | null;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
  onFollow: (searchedProfile: SearchedProfile) => void;
  onUnfollow: (profileId: number) => void;
};

const ProfileSearchContext = createContext<ProfileSearchContextType>({
  searchText: "",
  setSearchText: () => {},
  search: () => Promise.resolve(),
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
  onFollow: (searchedProfile: SearchedProfile) => {},
  onUnfollow: (profileId: number) => {},
});

type Props = {
  children: React.ReactNode;
};

const ProfileSearchContextProvider = ({ children }: Props) => {
  const [searchText, setSearchText] = useState("");

  const [data, setData] = useState<SearchedProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);

  const { addFollowing, removeFollowing, authProfile } = useAuthProfileContext();

  const handleSearch = useCallback(async () => {
    if (searchText) {
      setHasInitialFetchError(false);
      setHasFetchNextError(false);
      const { error, data } = await searchProfiles(searchText, authProfile.id);
      if (!error && data) {
        setData(data.results);
        setFetchNextUrl(data.next);
      } else {
        setHasInitialFetchError(true);
      }
      setInitialFetchComplete(true);
      setRefreshing(false);
    }
  }, [searchText, authProfile.id]);

  // refresh feed fetch if user swipes down
  const refreshSearch = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await handleSearch();
    setRefreshing(false);
  };

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);
      const { error, data: fetchNextData } = await axiosFetch<PaginatedSearchedProfileResponse>(fetchNextUrl);
      if (!error && fetchNextData) {
        setData((prev) => [...prev, ...fetchNextData.results]);
        setFetchNextUrl(fetchNextData.next);
      } else {
        setHasFetchNextError(true);
      }
      setFetchNextLoading(false);
    }
  }, [fetchNextUrl]);

  const onUnfollow = async (profileId: number) => {
    removeFollowing(profileId);
    setData((prev) => {
      if (prev) {
        return prev.map((profile) => {
          if (profile.id === profileId) {
            return { ...profile, is_following: false };
          }
          return profile;
        });
      }
      return prev;
    });
  };

  const onFollow = (searchedProfile: SearchedProfile) => {
    addFollowing(searchedProfile);
    setData((prev) => {
      if (prev) {
        return prev.map((profile) => {
          if (profile.id === searchedProfile.id) {
            return { ...profile, is_following: true };
          }
          return profile;
        });
      }
      return prev;
    });
  };

  const value = {
    searchText,
    setSearchText,
    search: handleSearch,
    data,
    setData,
    refetch: handleSearch,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refresh: refreshSearch,
    refreshing,
    onFollow,
    onUnfollow,
  };

  return <ProfileSearchContext.Provider value={value}>{children}</ProfileSearchContext.Provider>;
};

export default ProfileSearchContextProvider;

export const useProfileSearchContext = () => {
  const {
    searchText,
    setSearchText,
    search,
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
    onFollow,
    onUnfollow,
  } = useContext(ProfileSearchContext);
  return {
    searchText,
    setSearchText,
    search,
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
    onFollow,
    onUnfollow,
  };
};
