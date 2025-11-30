import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { ProfileDetails } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";
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
};

const ProfileDetailsManagerContext = createContext<ProfileDetailsManagerContextType>({
  onFollow: (profileId: number) => {},
  onUnfollow: (profileId: number) => {},
});

type Props = { children: React.ReactNode };

const ProfileDetailsManagerContextProvider = ({ children }: Props) => {
  const { addFollowing, removeFollowing } = useAuthProfileContext();

  const queryClient = useQueryClient();

  const profileSearch = useProfileSearchContext();

  const onFollow = (profileId: number) => {
    addFollowing();
    // follow profile wherever it appears in the app
    queryClient.setQueryData(["profile", profileId.toString()], (oldData: ProfileDetails) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        is_following: true,
      };
    });
    // handle updating the follow/un-follow button in the profile search screen in Explore tab
    profileSearch.setData((prev) =>
      prev?.map((profile) => {
        if (profile.id === profileId) {
          return { ...profile, is_following: true };
        }
        return profile;
      }),
    );
    // refresh the feed posts query to add the followed profile to the feed
    queryClient.refetchQueries({ queryKey: ["posts", "feed"] });
  };

  const onUnfollow = (profileId: number) => {
    removeFollowing();
    // unfollow profile wherever it appears in the app
    queryClient.setQueryData(["profile", profileId.toString()], (oldData: ProfileDetails) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        is_following: false,
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
    queryClient.refetchQueries({ queryKey: ["posts", "feed"] });
  };

  const value = { onFollow, onUnfollow };

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
