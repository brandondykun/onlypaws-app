import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { ProfileDetails } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";
import { useAuthUserContext } from "./AuthUserContext";
import { useProfileSearchContext } from "./ProfileSearchContext";

// Profile details manager for profiles throughout the app.
// 'Profile details' is the screen that shows a profile's information and its posts in the preview squares.
// Any time a profile is followed or un-followed, it should be modified through this
// manager using the onFollow and onUnfollow functions.
// This will ensure that the change is propagated appropriately throughout the app so if the
// profile appears in another screen, the change will be reflected immediately.

type ProfileDetailsManagerContextType = {
  onFollow: (profileId: number) => void;
  onUnfollow: (profileId: number) => void;
  onCancelFollowRequest: (profileId: number) => void;
  onFollowRequestAccepted: (profileId: number) => void;
};

const ProfileDetailsManagerContext = createContext<ProfileDetailsManagerContextType>({
  onFollow: (profileId: number) => {},
  onUnfollow: (profileId: number) => {},
  onCancelFollowRequest: (profileId: number) => {},
  onFollowRequestAccepted: (profileId: number) => {},
});

type Props = { children: React.ReactNode };

const ProfileDetailsManagerContextProvider = ({ children }: Props) => {
  const { addFollowing, removeFollowing } = useAuthProfileContext();
  const { selectedProfileId } = useAuthUserContext();

  const queryClient = useQueryClient();

  const profileSearch = useProfileSearchContext();

  const onFollow = (profileId: number) => {
    // follow profile wherever it appears in the app
    queryClient.setQueryData([selectedProfileId, "profile", profileId.toString()], (oldData: ProfileDetails) => {
      if (!oldData) return oldData;
      // if the profile is private, set has_requested_follow to true
      if (oldData.is_private) {
        return {
          ...oldData,
          has_requested_follow: true,
        };
      }
      addFollowing();
      return {
        ...oldData,
        is_following: true,
        followers_count: oldData.followers_count + 1,
      };
    });
    // handle updating the follow/un-follow button in the profile search screen in Explore tab
    profileSearch.setData((prev) =>
      prev?.map((profile) => {
        if (profile.id === profileId) {
          if (profile.is_private) {
            return { ...profile, has_requested_follow: true };
          }
          return { ...profile, is_following: true };
        }
        return profile;
      }),
    );
    // refresh the feed posts query to add the followed profile to the feed
    queryClient.refetchQueries({ queryKey: [selectedProfileId, "posts", "feed"] });
    // refetch the sent follow requests query to update the follow request list
    queryClient.refetchQueries({ queryKey: [selectedProfileId, "follow-requests", "sent"] });
  };

  // handle a private profile accepting a follow request
  const onFollowRequestAccepted = (profileId: number) => {
    // handle updating the follow/un-follow button in the profile search screen in Explore tab
    profileSearch.setData((prev) =>
      prev?.map((profile) => {
        if (profile.id === profileId) {
          return {
            ...profile,
            is_following: true,
            has_requested_follow: false,
          };
        }
        return profile;
      }),
    );

    // refresh the feed posts query to add the followed profile to the feed
    queryClient.refetchQueries({ queryKey: [selectedProfileId, "posts", "feed"] });
    // refresh the profile details query to update the followers count
    queryClient.refetchQueries({ queryKey: [selectedProfileId, "profile", profileId.toString()] });
    // refresh the profile posts query to fetch the now visible posts of the followed private profile
    queryClient.refetchQueries({ queryKey: [selectedProfileId, "posts", "profile", profileId.toString()] });
  };

  const onUnfollow = (profileId: number) => {
    removeFollowing();
    // unfollow profile wherever it appears in the app
    queryClient.setQueryData([selectedProfileId, "profile", profileId.toString()], (oldData: ProfileDetails) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        is_following: false,
        followers_count: oldData.followers_count - 1,
      };
    });
    // handle updating the follow/un-follow button in the profile search screen in Explore tab
    profileSearch.setData((prev) =>
      prev?.map((profile) => {
        if (profile.id === profileId) {
          return { ...profile, is_following: false };
        }
        return profile;
      }),
    );
    // refresh the feed posts query to remove the unfollowed profile from the feed
    queryClient.refetchQueries({ queryKey: [selectedProfileId, "posts", "feed"] });
  };

  const onCancelFollowRequest = (profileId: number) => {
    queryClient.setQueryData([selectedProfileId, "profile", profileId.toString()], (oldData: ProfileDetails) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        has_requested_follow: false,
      };
    });
    // handle updating the follow/un-follow button in the profile search screen in Explore tab
    profileSearch.setData((prev) =>
      prev?.map((profile) => {
        if (profile.id === profileId) {
          return { ...profile, has_requested_follow: false };
        }
        return profile;
      }),
    );
  };

  const value = { onFollow, onUnfollow, onCancelFollowRequest, onFollowRequestAccepted };

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
