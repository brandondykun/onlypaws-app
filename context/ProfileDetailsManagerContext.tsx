import { createContext, useContext } from "react";

import { followProfileInState, unFollowProfileInState } from "@/utils/utils";

import { useAuthProfileContext } from "./AuthProfileContext";
import { useExploreProfileDetailsContext } from "./ExploreProfileDetailsContext";
import { useFeedProfileDetailsContext } from "./FeedProfileDetailsContext";
import { usePostsProfileDetailsContext } from "./PostsProfileDetailsContext";
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

  const exploreProfile = useExploreProfileDetailsContext();
  const feedProfile = useFeedProfileDetailsContext();
  const postsProfile = usePostsProfileDetailsContext();
  const profileSearch = useProfileSearchContext();

  const onFollow = (profileId: number) => {
    addFollowing();
    // follow profile wherever it appears in the app
    followProfileInState(exploreProfile.profile.setData);
    followProfileInState(feedProfile.profile.setData);
    followProfileInState(postsProfile.profile.setData);
    // handle updating the follow/un-follow button in the profile search screen in Explore tab
    profileSearch.setData((prev) =>
      prev?.map((profile) => {
        if (profile.id === profileId) {
          return { ...profile, is_following: true };
        }
        return profile;
      }),
    );
  };

  const onUnfollow = (profileId: number) => {
    removeFollowing();
    // unfollow profile wherever it appears in the app
    unFollowProfileInState(exploreProfile.profile.setData);
    unFollowProfileInState(feedProfile.profile.setData);
    unFollowProfileInState(postsProfile.profile.setData);
    // handle updating the follow/un-follow button in the profile search screen in Explore tab
    profileSearch.setData((prev) =>
      prev?.map((profile) => {
        if (profile.id === profileId) {
          return { ...profile, is_following: false };
        }
        return profile;
      }),
    );
  };

  const value = { onFollow, onUnfollow };

  return <ProfileDetailsManagerContext.Provider value={value}>{children}</ProfileDetailsManagerContext.Provider>;
};

export default ProfileDetailsManagerContextProvider;

export const useProfileDetailsManagerContext = () => {
  const { onFollow, onUnfollow } = useContext(ProfileDetailsManagerContext);
  return { onFollow, onUnfollow };
};
