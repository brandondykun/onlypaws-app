import { createContext, useContext, useState } from "react";

import usePosts from "@/hooks/usePosts";
import useProfileDetails from "@/hooks/useProfileDetails";
import { PostDetailed } from "@/types";
import { ProfileDetails as ProfileDetailsType } from "@/types";

type FeedProfileDetailsContextType = {
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
    onLike: (postId: number) => void;
    onUnlike: (postId: number) => void;
    onComment: (postId: number) => void;
  };
  profile: {
    loading: boolean;
    data: ProfileDetailsType | null;
    error: string;
    setData: React.Dispatch<React.SetStateAction<ProfileDetailsType | null>>;
    refetch: () => Promise<void>;
    refreshing: boolean;
  };
  setProfileId: React.Dispatch<React.SetStateAction<number | null>>;
};

const FeedProfileDetailsContext = createContext<FeedProfileDetailsContextType>({
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
    onLike: (postId: number) => {},
    onUnlike: (postId: number) => {},
    onComment: (postId: number) => {},
  },
  profile: {
    loading: false,
    data: null,
    error: "",
    setData: () => {},
    refetch: () => Promise.resolve(),
    refreshing: false,
  },
  setProfileId: () => {},
});

type Props = {
  children: React.ReactNode;
};

const FeedProfileDetailsContextProvider = ({ children }: Props) => {
  const [profileId, setProfileId] = useState<number | null>(null);

  const posts = usePosts(profileId);
  const profile = useProfileDetails(profileId);

  const value = { posts, profile, setProfileId };

  return <FeedProfileDetailsContext.Provider value={value}>{children}</FeedProfileDetailsContext.Provider>;
};

export default FeedProfileDetailsContextProvider;

export const useFeedProfileDetailsContext = () => {
  const { posts, profile, setProfileId } = useContext(FeedProfileDetailsContext);
  return { posts, profile, setProfileId };
};
