import { InfiniteData, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { createContext, useContext, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { getProfileDetailsForQuery } from "@/api/profile";
import { COLORS } from "@/constants/Colors";
import { PetType, PostsDetailedPage, ProfileDetails as ProfileDetailsType, ProfileImage } from "@/types";
import { queryKeys } from "@/utils/query/queryKeys";

import { useAuthUserContext } from "./AuthUserContext";
import { useColorMode } from "./ColorModeContext";

// Context for the auth profile details.
// This is the profile details of the user who is currently logged in.
// It is used to display the profile details on the profile screen and to update the profile details.
// Since users can have multiple profiles, this context manages the currently selected profile.
//
// This context acts as a guard - it won't render children until the profile is loaded.
// This guarantees that selectedProfileId and authProfile are always valid (non-null).

type AuthProfileContextType = {
  // Guaranteed non-null - this context guards children until these are loaded
  selectedProfileId: number;
  authProfile: ProfileDetailsType;
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

const AuthProfileContext = createContext<AuthProfileContextType | null>(null);

type Props = {
  children: React.ReactNode;
};

const AuthProfileContextProvider = ({ children }: Props) => {
  const [refreshing, setRefreshing] = useState(false);

  const { selectedProfileId, authLoading } = useAuthUserContext();
  const { isDarkMode } = useColorMode();
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
    queryKey: selectedProfileId
      ? queryKeys.profile.details(selectedProfileId, selectedProfileId.toString())
      : ["profile", "pending"],
    queryFn: () => fetchProfile(selectedProfileId!),
    enabled: !!selectedProfileId && !authLoading,
    staleTime: 0, // Always refetch to get latest data
    placeholderData: (previousData) => previousData, // Keep previous profile data while fetching new one
  });

  // Guard: Don't render children until we have both selectedProfileId and profile data
  // This guarantees that all child components receive valid, non-null values
  if (!selectedProfileId || !profileData) {
    return (
      <View style={[s.loadingView, { backgroundColor: isDarkMode ? COLORS.zinc[950] : COLORS.zinc[100] }]}>
        <ActivityIndicator size="large" color={COLORS.zinc[500]} />
      </View>
    );
  }

  // At this point, both selectedProfileId and profileData are guaranteed non-null
  const authProfile = profileData;

  // Helper function to update the cache
  const updateCache = (updater: (prev: ProfileDetailsType) => ProfileDetailsType) => {
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
      { queryKey: queryKeys.posts.profile(selectedProfileId, selectedProfileId) },
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

  const value: AuthProfileContextType = {
    selectedProfileId,
    authProfile,
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
  if (!context) {
    throw new Error("useAuthProfileContext must be used within AuthProfileContextProvider");
  }
  return context;
};

const s = StyleSheet.create({
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingViewText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "300",
  },
});
