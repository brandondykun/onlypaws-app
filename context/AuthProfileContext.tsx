import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getProfileDetails } from "@/api/profile";
import { PetType, ProfileDetails as ProfileDetailsType, ProfileImage } from "@/types";

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
  updateAuthProfile: (name: string, about: string | null, breed: string | null, petType: PetType | null) => void;
  updateUsername: (username: string) => void;
  refetch: () => Promise<void>;
  refreshing: boolean;
  backgroundRefreshing: boolean;
};

const AuthProfileContext = createContext<AuthProfileContextType>({
  authProfile: {
    id: null!,
    username: null!,
    name: "",
    about: null,
    image: null,
    is_following: false,
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    breed: "",
    pet_type: null,
  },
  loading: false,
  updateProfileImage: (image: ProfileImage) => {},
  updateAboutText: (aboutText: string) => {},
  removeFollowing: () => {},
  addFollowing: () => {},
  updatePostsCount: (action: "add" | "subtract", amount: number) => {},
  updateName: (name: string) => {},
  updateAuthProfile: (name: string, about: string | null, breed: string | null, petType: PetType | null) => {},
  updateUsername: (username: string) => {},
  refetch: () => Promise.resolve(),
  refreshing: false,
  backgroundRefreshing: false,
});

type Props = {
  children: React.ReactNode;
};

const defaultProfile = {
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
};

const AuthProfileContextProvider = ({ children }: Props) => {
  const [authProfile, setAuthProfile] = useState<ProfileDetailsType>(defaultProfile);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);

  const { selectedProfileId, authLoading } = useAuthUserContext();

  // refresh the profile details without setting the loading state.
  // setting the loading state to true will trigger the auth interceptor to
  // return null and redirect the app the the index route (feed screen).
  // since the profile has been authenticated already, there's no need to set loading to true.
  const backgroundRefreshProfileDetails = useCallback(async () => {
    if (selectedProfileId && !authLoading) {
      setBackgroundRefreshing(true);
      // the second argument is only necessary so the backend doesn't throw an error
      const { error, data } = await getProfileDetails(selectedProfileId, selectedProfileId);
      if (!error && data) {
        setAuthProfile(data);
      }
      setBackgroundRefreshing(false);
    }
  }, [authLoading, selectedProfileId]);

  const fetchProfileDetails = useCallback(async () => {
    // if fetching a profile for the first time on app load
    if (selectedProfileId && !authLoading && !authProfile.username) {
      setLoading(true);
      // the second argument is only necessary so the backend doesn't throw an error
      const { error, data } = await getProfileDetails(selectedProfileId, selectedProfileId);
      if (!error && data) {
        setAuthProfile(data);
      }
      setLoading(false);
    } else if (selectedProfileId && !authLoading && authProfile.username) {
      // if the user is already authenticated but the user changes profiles, refresh in the background
      // without this check, any time a profile is changed, the app would redirect to the index route (feed screen)
      backgroundRefreshProfileDetails();
    }
  }, [authLoading, selectedProfileId, authProfile.username, backgroundRefreshProfileDetails]);

  useEffect(() => {
    fetchProfileDetails();
  }, [fetchProfileDetails]);

  useEffect(() => {
    if (!selectedProfileId) {
      setAuthProfile(defaultProfile);
    }
  }, [selectedProfileId]);

  // refresh profile if user swipes down
  const refreshProfile = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await backgroundRefreshProfileDetails();
    setRefreshing(false);
  };

  const updateProfileImage = (image: ProfileImage) => {
    setAuthProfile((prev) => {
      return { ...prev, image: image };
    });
  };

  const updateAboutText = (aboutText: string) => {
    setAuthProfile((prev) => {
      return { ...prev, about: aboutText };
    });
  };

  const updateName = (name: string) => {
    setAuthProfile((prev) => {
      return { ...prev, name: name };
    });
  };

  const updateAuthProfile = (name: string, about: string | null, breed: string | null, petType: PetType | null) => {
    setAuthProfile((prev) => {
      return { ...prev, name: name, about: about, breed: breed, pet_type: petType };
    });
  };

  const updateUsername = (username: string) => {
    setAuthProfile((prev) => {
      return { ...prev, username };
    });
  };

  const removeFollowing = () => {
    setAuthProfile((prev) => {
      return {
        ...prev,
        following_count: prev.following_count - 1,
      };
    });
  };

  const addFollowing = () => {
    setAuthProfile((prev) => {
      return {
        ...prev,
        following_count: prev.following_count + 1,
      };
    });
  };

  const updatePostsCount = (action: "add" | "subtract", amount: number) => {
    setAuthProfile((prev) => {
      if (action === "add") {
        return {
          ...prev,
          posts_count: prev.posts_count + amount,
        };
      } else {
        return {
          ...prev,
          posts_count: prev.posts_count - amount,
        };
      }
    });
  };

  const value = {
    authProfile,
    loading,
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
    backgroundRefreshing,
  };

  return <AuthProfileContext.Provider value={value}>{children}</AuthProfileContext.Provider>;
};

export default AuthProfileContextProvider;

export const useAuthProfileContext = () => {
  const {
    authProfile,
    loading,
    updateProfileImage,
    updateAboutText,
    removeFollowing,
    addFollowing,
    updatePostsCount,
    updateName,
    updateAuthProfile,
    updateUsername,
    refetch,
    refreshing,
    backgroundRefreshing,
  } = useContext(AuthProfileContext);
  return {
    authProfile,
    loading,
    updateProfileImage,
    updateAboutText,
    removeFollowing,
    addFollowing,
    updatePostsCount,
    updateName,
    updateAuthProfile,
    updateUsername,
    refetch,
    refreshing,
    backgroundRefreshing,
  };
};
