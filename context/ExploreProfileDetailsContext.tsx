import { createContext, useContext, useState } from "react";

import usePosts from "@/hooks/usePosts";
import useProfileDetails from "@/hooks/useProfileDetails";
import { PostDetailed } from "@/types";
import { ProfileDetails as ProfileDetailsType } from "@/types";

type ExploreProfileDetailsContextType = {
  posts: {
    data: PostDetailed[] | null;
    setData: React.Dispatch<React.SetStateAction<PostDetailed[]>>;
    fetchNext: () => Promise<void>;
    fetchNextUrl: string | null;
    refetch: () => Promise<void>;
    fetchNextLoading: boolean;
    hasFetchNextError: boolean;
    refreshing: boolean;
    hasInitialFetchError: boolean;
    initialFetchComplete: boolean;
  };
  profile: {
    loading: boolean;
    data: ProfileDetailsType | null;
    error: boolean;
    setData: React.Dispatch<React.SetStateAction<ProfileDetailsType | null>>;
    refetch: () => Promise<void>;
    refreshing: boolean;
  };
  setProfileId: React.Dispatch<React.SetStateAction<number | null>>;
};

const ExploreProfileDetailsContext = createContext<ExploreProfileDetailsContextType>({
  posts: {
    data: null,
    setData: () => {},
    fetchNext: () => Promise.resolve(),
    fetchNextUrl: null,
    refetch: () => Promise.resolve(),
    fetchNextLoading: false,
    hasFetchNextError: false,
    refreshing: false,
    hasInitialFetchError: false,
    initialFetchComplete: false,
  },
  profile: {
    loading: false,
    data: null,
    error: false,
    setData: () => {},
    refetch: () => Promise.resolve(),
    refreshing: false,
  },
  setProfileId: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ExploreProfileDetailsContextProvider = ({ children }: Props) => {
  const [profileId, setProfileId] = useState<number | null>(null);

  const posts = usePosts(profileId);
  const profile = useProfileDetails(profileId);

  const value = { posts, profile, setProfileId };

  return <ExploreProfileDetailsContext.Provider value={value}>{children}</ExploreProfileDetailsContext.Provider>;
};

export default ExploreProfileDetailsContextProvider;

export const useExploreProfileDetailsContext = () => {
  const { posts, profile, setProfileId } = useContext(ExploreProfileDetailsContext);
  return { posts, profile, setProfileId };
};
