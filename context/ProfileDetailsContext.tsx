import { createContext, useContext, useState } from "react";

import usePosts from "@/hooks/usePosts";
import useProfileDetails from "@/hooks/useProfileDetails";
import { PostDetailed } from "@/types";
import { ProfileDetails as ProfileDetailsType } from "@/types";

type ProfileDetailsContextType = {
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

const ProfileDetailsContext = createContext<ProfileDetailsContextType>({
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

const ProfileDetailsContextProvider = ({ children }: Props) => {
  const [profileId, setProfileId] = useState<number | null>(null);

  const posts = usePosts(profileId);
  const profile = useProfileDetails(profileId);

  const value = { posts, profile, setProfileId };

  return <ProfileDetailsContext.Provider value={value}>{children}</ProfileDetailsContext.Provider>;
};

export default ProfileDetailsContextProvider;

export const useProfileDetailsContext = () => {
  const { posts, profile, setProfileId } = useContext(ProfileDetailsContext);
  return { posts, profile, setProfileId };
};
