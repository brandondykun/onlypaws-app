import { InfiniteData, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { createContext, useContext, useState } from "react";

import { getProfileDetailsForQuery } from "@/api/profile";
import { PetType, PostsDetailedPage, ProfileDetails as ProfileDetailsType, ProfileImage } from "@/types";

import { useAuthUserContext } from "./AuthUserContext";

// Context for the auth profile details.
// This is the profile details of the user who is currently logged in.
// It is used to display the profile details on the profile screen and to update the profile details.
// Since users can have multiple profiles, this context manages the currently selected profile.

type AuthProfileContextType = {
  authProfile: ProfileDetailsType;
  loading: boolean;
  updateProfileImage: (image: ProfileImage) => void;
  updateAboutText: (aboutText: string) => void;
  removeFollowing: () => void;
  addFollowing: () => void;
  updatePostsCount: (action: "add" | "subtract", amount: number) => void;
  updateName: (name: string) => void;
  updateAuthProfile: (
    name: string,
    about: string | null,
    breed: string | null,
    petType: PetType | null,
    isPrivate: boolean,
  ) => void;
  updateUsername: (username: string) => void;
  refetch: () => Promise<void>;
  refreshing: boolean;
  backgroundRefreshing: boolean;
  addFollower: () => void;
  removeFollower: () => void;
};

const defaultProfile: ProfileDetailsType = {
  id: null!,
  username: "",
  name: "",
  about: "",
  image: null,
  is_following: false,
  posts_count: 0,
  followers_count: 0,
  following_count: 0,
  breed: "",
  pet_type: null,
  profile_type: "regular",
  is_private: false,
  can_view_posts: true,
  has_requested_follow: false,
};

const AuthProfileContext = createContext<AuthProfileContextType>({
  authProfile: defaultProfile,
  loading: false,
  updateProfileImage: (image: ProfileImage) => {},
  updateAboutText: (aboutText: string) => {},
  removeFollowing: () => {},
  addFollowing: () => {},
  updatePostsCount: (action: "add" | "subtract", amount: number) => {},
  updateName: (name: string) => {},
  updateAuthProfile: (
    name: string,
    about: string | null,
    breed: string | null,
    petType: PetType | null,
    isPrivate: boolean,
  ) => {},
  updateUsername: (username: string) => {},
  refetch: () => Promise.resolve(),
  refreshing: false,
  backgroundRefreshing: false,
  addFollower: () => {},
  removeFollower: () => {},
});

type Props = {
  children: React.ReactNode;
};

const AuthProfileContextProvider = ({ children }: Props) => {
  const [refreshing, setRefreshing] = useState(false);

  const { selectedProfileId, authLoading } = useAuthUserContext();
  const queryClient = useQueryClient();

  const fetchProfile = async (id: number) => {
    const res = await getProfileDetailsForQuery(id);
    return res.data;
  };

  // Use useQuery with enabled flag to handle null selectedProfileId
  const {
    data: profileData,
    isLoading,
    isFetching,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: [selectedProfileId, "profile", selectedProfileId?.toString()],
    queryFn: () => fetchProfile(selectedProfileId!),
    enabled: !!selectedProfileId && !authLoading,
    staleTime: 0, // Always refetch to get latest data
    placeholderData: (previousData) => previousData, // Keep previous profile data while fetching new one
  });

  const authProfile = profileData || defaultProfile;

  // Helper function to update the cache
  const updateCache = (updater: (prev: ProfileDetailsType) => ProfileDetailsType) => {
    if (!selectedProfileId) return;

    // Use the exact same format as the useQuery key
    const queryKey = [selectedProfileId, "profile", selectedProfileId.toString()];

    // Use setQueryData with exact key match
    queryClient.setQueryData<ProfileDetailsType>(queryKey, (oldData) => {
      if (!oldData) return oldData;
      return updater(oldData);
    });
  };

  // refresh profile if user swipes down
  const refreshProfile = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await queryRefetch();
    setRefreshing(false);
  };

  const updateProfileImage = (image: ProfileImage) => {
    updateCache((prev) => ({ ...prev, image }));
  };

  const updateAboutText = (aboutText: string) => {
    updateCache((prev) => ({ ...prev, about: aboutText }));
  };

  const updateName = (name: string) => {
    updateCache((prev) => ({ ...prev, name }));
  };

  const updateAuthProfile = (
    name: string,
    about: string | null,
    breed: string | null,
    petType: PetType | null,
    isPrivate: boolean,
  ) => {
    updateCache((prev) => ({
      ...prev,
      name,
      about,
      breed,
      pet_type: petType,
      is_private: isPrivate,
    }));
  };

  const updateUsername = (username: string) => {
    if (!selectedProfileId) return;

    // Update the profile cache
    updateCache((prev) => ({ ...prev, username }));

    // Helper to update posts data
    const updatePostsUsername = (oldData: InfiniteData<PostsDetailedPage> | undefined) => {
      if (!oldData || !oldData.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          results: page.results
            ? page.results.map((post) => ({
                ...post,
                profile: {
                  ...post.profile,
                  username,
                },
              }))
            : null,
        })),
      };
    };

    // Update username in all posts for this profile (authProfile posts)
    queryClient.setQueriesData<InfiniteData<PostsDetailedPage>>(
      { queryKey: [selectedProfileId, "posts", "profile", selectedProfileId.toString()] },
      updatePostsUsername,
    );
  };

  const removeFollowing = () => {
    updateCache((prev) => ({
      ...prev,
      following_count: prev.following_count - 1,
    }));
  };

  const addFollowing = () => {
    updateCache((prev) => ({
      ...prev,
      following_count: prev.following_count + 1,
    }));
  };

  const addFollower = () => {
    updateCache((prev) => ({
      ...prev,
      followers_count: prev.followers_count + 1,
    }));
  };

  const removeFollower = () => {
    updateCache((prev) => ({
      ...prev,
      followers_count: prev.followers_count - 1,
    }));
  };

  const updatePostsCount = (action: "add" | "subtract", amount: number) => {
    updateCache((prev) => ({
      ...prev,
      posts_count: action === "add" ? prev.posts_count + amount : prev.posts_count - amount,
    }));
  };

  const value = {
    authProfile,
    loading: isLoading,
    updateProfileImage,
    updateAboutText,
    removeFollowing,
    addFollowing,
    updatePostsCount,
    updateName,
    updateAuthProfile,
    updateUsername,
    refetch: refreshProfile,
    refreshing,
    backgroundRefreshing: isFetching && !isLoading && !refreshing,
    addFollower,
    removeFollower,
  };

  return <AuthProfileContext.Provider value={value}>{children}</AuthProfileContext.Provider>;
};

export default AuthProfileContextProvider;

export const useAuthProfileContext = () => {
  const context = useContext(AuthProfileContext);
  return context;
};
