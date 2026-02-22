import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useCallback } from "react";

import {
  followProfile as followProfileApi,
  unfollowProfile as unfollowProfileApi,
  removeFollower as removeFollowerApi,
} from "@/api/interactions";
import { ProfileDetails, SearchedProfile } from "@/types";
import { PaginatedResponse } from "@/types/shared/pagination";
import { removeInfiniteItemById, updateInfiniteItemByPublicId } from "@/utils/query/cacheUtils";
import { queryKeys } from "@/utils/query/queryKeys";
import toast from "@/utils/toast";

import { useAuthProfileContext } from "./AuthProfileContext";
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
  followProfile: (profileId: string, options?: FollowOptions) => void;
  unfollowProfile: (profileId: string) => void;
  cancelFollowRequest: (profileId: string) => void;
  onFollowRequestAccepted: (profileId: string) => void;
  removeFollower: (profileId: string) => void;
};

const ProfileDetailsManagerContext = createContext<ProfileDetailsManagerContextType>({
  followProfile: () => {},
  unfollowProfile: () => {},
  cancelFollowRequest: () => {},
  onFollowRequestAccepted: () => {},
  removeFollower: () => {},
});

type Props = { children: React.ReactNode };

type ProfileSearchQueryData = InfiniteData<PaginatedResponse<SearchedProfile>>;

const ProfileDetailsManagerContextProvider = ({ children }: Props) => {
  const {
    addFollowing,
    removeFollowing,
    removeFollower: removeFollowerAuthProfile,
    addFollower: addFollowerAuthProfile,
    selectedProfileId,
  } = useAuthProfileContext();

  const queryClient = useQueryClient();

  const { submittedSearchText } = useProfileSearchContext();

  // Helper function to update a profile in the search results cache
  const updateProfileSearchCache = useCallback(
    (profileId: string, updater: (profile: SearchedProfile) => SearchedProfile) => {
      if (!submittedSearchText) return;

      const queryKey = queryKeys.profileSearch.results(selectedProfileId, submittedSearchText);

      queryClient.setQueryData<ProfileSearchQueryData>(queryKey, (oldData) => {
        return updateInfiniteItemByPublicId(oldData, profileId, updater);
      });
    },
    [queryClient, submittedSearchText, selectedProfileId],
  );

  // Helper to update profile details cache
  const updateProfileDetailsCache = useCallback(
    (profileId: string, updater: (profile: ProfileDetails) => ProfileDetails) => {
      const queryKey = queryKeys.profile.details(selectedProfileId, profileId);

      queryClient.setQueryData(queryKey, (oldData: ProfileDetails | undefined) => {
        if (!oldData) return oldData;
        return updater(oldData);
      });
    },
    [queryClient, selectedProfileId],
  );

  // Optimistic update for follow action
  const applyFollowOptimistic = useCallback(
    (profileId: string, isPrivate: boolean) => {
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
    (profileId: string, wasPrivate: boolean) => {
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
    (profileId: string) => {
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
    (profileId: string) => {
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
    async (profileId: string, options?: FollowOptions) => {
      const isPrivate = options?.isPrivate ?? false;

      // Apply optimistic update
      applyFollowOptimistic(profileId, isPrivate);

      // Make API call
      const { error } = await followProfileApi(profileId);

      if (error) {
        // Revert on failure
        revertFollow(profileId, isPrivate);
        toast.error("There was an error following that account.");
      } else {
        // Success - trigger side effects only for public profiles (already following)
        if (!isPrivate) {
          queryClient.refetchQueries({ queryKey: queryKeys.posts.feed(selectedProfileId) });
        }
        // Always refetch sent follow requests (for private profiles this shows the pending request)
        queryClient.refetchQueries({ queryKey: queryKeys.followRequests.sent(selectedProfileId) });
      }
    },
    [applyFollowOptimistic, revertFollow, queryClient, selectedProfileId],
  );

  // Main unfollow function - handles API call, optimistic update, and revert
  const unfollowProfile = useCallback(
    async (profileId: string) => {
      // Apply optimistic update
      applyUnfollowOptimistic(profileId);

      // Make API call
      const { error } = await unfollowProfileApi(profileId);

      if (error) {
        // Revert on failure
        revertUnfollow(profileId);
        toast.error("There was an error unfollowing that account.");
      } else {
        // Success - refresh feed to remove unfollowed profile's posts
        queryClient.refetchQueries({ queryKey: queryKeys.posts.feed(selectedProfileId) });
      }
    },
    [applyUnfollowOptimistic, revertUnfollow, queryClient, selectedProfileId],
  );

  // Cancel a pending follow request
  const cancelFollowRequest = useCallback(
    (profileId: string) => {
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
    (profileId: string) => {
      updateProfileSearchCache(profileId, (profile) => ({
        ...profile,
        is_following: true,
        has_requested_follow: false,
      }));

      // Refresh queries to get updated data
      queryClient.refetchQueries({ queryKey: queryKeys.posts.feed(selectedProfileId) });
      queryClient.refetchQueries({ queryKey: queryKeys.profile.details(selectedProfileId, profileId) });
      queryClient.refetchQueries({ queryKey: queryKeys.posts.profile(selectedProfileId, profileId) });
    },
    [updateProfileSearchCache, queryClient, selectedProfileId],
  );

  const removeFollower = useCallback(
    async (profileId: string) => {
      // optimistic update
      removeFollowerAuthProfile();
      updateProfileDetailsCache(profileId, (profile) => ({
        ...profile,
        follows_you: false,
        following_count: profile.following_count - 1,
      }));
      updateProfileSearchCache(profileId, (profile) => ({
        ...profile,
        follows_you: false,
      }));

      // make API call
      const { error } = await removeFollowerApi(profileId);
      if (error) {
        // revert on failure
        addFollowerAuthProfile();
        updateProfileDetailsCache(profileId, (profile) => ({
          ...profile,
          follows_you: true,
          following_count: profile.following_count + 1,
        }));
        updateProfileSearchCache(profileId, (profile) => ({
          ...profile,
          follows_you: true,
        }));
        toast.error("There was an error removing that follower.");
      } else {
        // remove follower from followers list on the followers screen
        // the removed profile might not be loaded on that screen, but check to be sure
        queryClient.setQueriesData<InfiniteData<PaginatedResponse<ProfileDetails>>>(
          { queryKey: queryKeys.profile.followers(selectedProfileId, selectedProfileId) },
          (oldData) => removeInfiniteItemById(oldData, profileId),
        );
        toast.success("Follower removed successfully.");
      }
    },
    [
      removeFollowerAuthProfile,
      updateProfileDetailsCache,
      updateProfileSearchCache,
      queryClient,
      selectedProfileId,
      addFollowerAuthProfile,
    ],
  );

  const value = { followProfile, unfollowProfile, cancelFollowRequest, onFollowRequestAccepted, removeFollower };

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
