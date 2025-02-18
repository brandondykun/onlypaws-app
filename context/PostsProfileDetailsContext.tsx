import { createContext, useContext, useState } from "react";

import usePosts from "@/hooks/usePosts";
import useProfileDetails from "@/hooks/useProfileDetails";
import { PostDetailed } from "@/types";
import { ProfileDetails as ProfileDetailsType } from "@/types";

// Context for the Posts tab to fetch the profile details and posts of the selected profile (profileId).
// Used to view profiles of followers and following.

type PostsProfileDetailsContextType = {
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

const PostsProfileDetailsContext = createContext<PostsProfileDetailsContextType>({
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

const PostsProfileDetailsContextProvider = ({ children }: Props) => {
  const [profileId, setProfileId] = useState<number | null>(null);

  const posts = usePosts(profileId);
  const profile = useProfileDetails(profileId);

  const value = { posts, profile, setProfileId };

  return <PostsProfileDetailsContext.Provider value={value}>{children}</PostsProfileDetailsContext.Provider>;
};

export default PostsProfileDetailsContextProvider;

export const usePostsProfileDetailsContext = () => {
  const { posts, profile, setProfileId } = useContext(PostsProfileDetailsContext);
  return { posts, profile, setProfileId };
};
