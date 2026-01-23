import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useCallback } from "react";
import Toast from "react-native-toast-message";

import { followProfile as followProfileApi, unfollowProfile as unfollowProfileApi } from "@/api/interactions";
import { ProfileDetails, SearchedProfile } from "@/types";
import { PaginatedResponse } from "@/types/shared/pagination";

import { useAuthProfileContext } from "./AuthProfileContext";
import { useAuthUserContext } from "./AuthUserContext";
import { useProfileSearchContext } from "./ProfileSearchContext";

// Profile details manager for profiles throughout the app.
// Centralizes all follow/unfollow logic including:
// - API calls
// - Optimistic cache updates
// - Revert on failure
// - Post-success side effects (feed refresh, etc.)

type FollowOptions = {
  isPrivate?: boolean;
};

type ProfileDetailsManagerContextType = {
  followProfile: (profileId: number, options?: FollowOptions) => void;
  unfollowProfile: (profileId: number) => void;
  cancelFollowRequest: (profileId: number) => void;
  onFollowRequestAccepted: (profileId: number) => void;
};

const ProfileDetailsManagerContext = createContext<ProfileDetailsManagerContextType>({
  followProfile: () => {},
  unfollowProfile: () => {},
  cancelFollowRequest: () => {},
  onFollowRequestAccepted: () => {},
});

type Props = { children: React.ReactNode };

type ProfileSearchQueryData = InfiniteData<PaginatedResponse<SearchedProfile>>;

const ProfileDetailsManagerContextProvider = ({ children }: Props) => {
  const { addFollowing, removeFollowing } = useAuthProfileContext();
  const { selectedProfileId } = useAuthUserContext();

  const queryClient = useQueryClient();

  const { submittedSearchText } = useProfileSearchContext();

  // Helper function to update a profile in the search results cache
  const updateProfileSearchCache = useCallback(
    (profileId: number, updater: (profile: SearchedProfile) => SearchedProfile) => {
      if (!submittedSearchText) return;

      queryClient.setQueryData<ProfileSearchQueryData>(["profileSearch", submittedSearchText], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((profile) => (profile.id === profileId ? updater(profile) : profile)),
          })),
        };
      });
    },
    [queryClient, submittedSearchText],
  );

  // Helper to update profile details cache
  const updateProfileDetailsCache = useCallback(
    (profileId: number, updater: (profile: ProfileDetails) => ProfileDetails) => {
      queryClient.setQueryData(
        [selectedProfileId, "profile", profileId.toString()],
        (oldData: ProfileDetails | undefined) => {
          if (!oldData) return oldData;
          return updater(oldData);
        },
      );
    },
    [queryClient, selectedProfileId],
  );

  // Optimistic update for follow action
  const applyFollowOptimistic = useCallback(
    (profileId: number, isPrivate: boolean) => {
      if (isPrivate) {
        // Private profile: set has_requested_follow
        updateProfileDetailsCache(profileId, (profile) => ({
          ...profile,
          has_requested_follow: true,
        }));
        updateProfileSearchCache(profileId, (profile) => ({
          ...profile,
          has_requested_follow: true,
        }));
      } else {
        // Public profile: set is_following and increment count
        addFollowing();
        updateProfileDetailsCache(profileId, (profile) => ({
          ...profile,
          is_following: true,
          followers_count: profile.followers_count + 1,
        }));
        updateProfileSearchCache(profileId, (profile) => ({
          ...profile,
          is_following: true,
        }));
      }
    },
    [updateProfileDetailsCache, updateProfileSearchCache, addFollowing],
  );

  // Revert follow action
  const revertFollow = useCallback(
    (profileId: number, wasPrivate: boolean) => {
      if (wasPrivate) {
        // Revert private profile follow request
        updateProfileDetailsCache(profileId, (profile) => ({
          ...profile,
          has_requested_follow: false,
        }));
        updateProfileSearchCache(profileId, (profile) => ({
          ...profile,
          has_requested_follow: false,
        }));
      } else {
        // Revert public profile follow
        removeFollowing();
        updateProfileDetailsCache(profileId, (profile) => ({
          ...profile,
          is_following: false,
          followers_count: profile.followers_count - 1,
        }));
        updateProfileSearchCache(profileId, (profile) => ({
          ...profile,
          is_following: false,
        }));
      }
    },
    [updateProfileDetailsCache, updateProfileSearchCache, removeFollowing],
  );

  // Optimistic update for unfollow action
  const applyUnfollowOptimistic = useCallback(
    (profileId: number) => {
      removeFollowing();
      updateProfileDetailsCache(profileId, (profile) => ({
        ...profile,
        is_following: false,
        followers_count: profile.followers_count - 1,
      }));
      updateProfileSearchCache(profileId, (profile) => ({
        ...profile,
        is_following: false,
      }));
    },
    [updateProfileDetailsCache, updateProfileSearchCache, removeFollowing],
  );

  // Revert unfollow action
  const revertUnfollow = useCallback(
    (profileId: number) => {
      addFollowing();
      updateProfileDetailsCache(profileId, (profile) => ({
        ...profile,
        is_following: true,
        followers_count: profile.followers_count + 1,
      }));
      updateProfileSearchCache(profileId, (profile) => ({
        ...profile,
        is_following: true,
      }));
    },
    [updateProfileDetailsCache, updateProfileSearchCache, addFollowing],
  );

  // Main follow function - handles API call, optimistic update, and revert
  const followProfile = useCallback(
    async (profileId: number, options?: FollowOptions) => {
      const isPrivate = options?.isPrivate ?? false;

      // Apply optimistic update
      applyFollowOptimistic(profileId, isPrivate);

      // Make API call
      const { error } = await followProfileApi(profileId);

      if (error) {
        // Revert on failure
        revertFollow(profileId, isPrivate);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error following that account.",
        });
      } else {
        // Success - trigger side effects only for public profiles (already following)
        if (!isPrivate) {
          queryClient.refetchQueries({ queryKey: [selectedProfileId, "posts", "feed"] });
        }
        // Always refetch sent follow requests (for private profiles this shows the pending request)
        queryClient.refetchQueries({ queryKey: [selectedProfileId, "follow-requests", "sent"] });
      }
    },
    [applyFollowOptimistic, revertFollow, queryClient, selectedProfileId],
  );

  // Main unfollow function - handles API call, optimistic update, and revert
  const unfollowProfile = useCallback(
    async (profileId: number) => {
      // Apply optimistic update
      applyUnfollowOptimistic(profileId);

      // Make API call
      const { error } = await unfollowProfileApi(profileId);

      if (error) {
        // Revert on failure
        revertUnfollow(profileId);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error unfollowing that account.",
        });
      } else {
        // Success - refresh feed to remove unfollowed profile's posts
        queryClient.refetchQueries({ queryKey: [selectedProfileId, "posts", "feed"] });
      }
    },
    [applyUnfollowOptimistic, revertUnfollow, queryClient, selectedProfileId],
  );

  // Cancel a pending follow request
  const cancelFollowRequest = useCallback(
    (profileId: number) => {
      updateProfileDetailsCache(profileId, (profile) => ({
        ...profile,
        has_requested_follow: false,
      }));
      updateProfileSearchCache(profileId, (profile) => ({
        ...profile,
        has_requested_follow: false,
      }));
    },
    [updateProfileDetailsCache, updateProfileSearchCache],
  );

  // Handle a private profile accepting a follow request
  const onFollowRequestAccepted = useCallback(
    (profileId: number) => {
      updateProfileSearchCache(profileId, (profile) => ({
        ...profile,
        is_following: true,
        has_requested_follow: false,
      }));

      // Refresh queries to get updated data
      queryClient.refetchQueries({ queryKey: [selectedProfileId, "posts", "feed"] });
      queryClient.refetchQueries({ queryKey: [selectedProfileId, "profile", profileId.toString()] });
      queryClient.refetchQueries({ queryKey: [selectedProfileId, "posts", "profile", profileId.toString()] });
    },
    [updateProfileSearchCache, queryClient, selectedProfileId],
  );

  const value = { followProfile, unfollowProfile, cancelFollowRequest, onFollowRequestAccepted };

  return <ProfileDetailsManagerContext.Provider value={value}>{children}</ProfileDetailsManagerContext.Provider>;
};

export default ProfileDetailsManagerContextProvider;

export const useProfileDetailsManagerContext = () => {
  const context = useContext(ProfileDetailsManagerContext);
  if (!context) {
    throw new Error("useProfileDetailsManagerContext must be used within ProfileDetailsManagerContextProvider");
  }
  return context;
};
