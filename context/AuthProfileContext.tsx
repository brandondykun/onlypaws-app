import { createContext, useContext, useEffect, useState } from "react";

import { getProfileDetails } from "@/api/profile";
import { Profile, ProfileDetails as ProfileDetailsType, ProfileImage } from "@/types";

import { useAuthUserContext } from "./AuthUserContext";

type AuthProfileContextType = {
  authProfile: ProfileDetailsType;
  updateProfileImage: (image: ProfileImage) => void;
  updateAboutText: (aboutText: string) => void;
  removeFollowing: (profileId: number) => void;
  addFollowing: (profile: Profile) => void;
  updatePostsCount: (action: "add" | "subtract", amount: number) => void;
  updateName: (name: string) => void;
};

const AuthProfileContext = createContext<AuthProfileContextType>({
  authProfile: {
    id: null!,
    username: null!,
    name: "",
    about: null,
    image: null,
    followers: [],
    following: [],
    is_following: false,
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
  },
  updateProfileImage: (image: ProfileImage) => {},
  updateAboutText: (aboutText: string) => {},
  removeFollowing: (profileId: number) => {},
  addFollowing: (profile: Profile) => {},
  updatePostsCount: (action: "add" | "subtract", amount: number) => {},
  updateName: (name: string) => {},
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
  followers: [],
  following: [],
  is_following: false,
  posts_count: 0,
  followers_count: 0,
  following_count: 0,
};

const AuthProfileContextProvider = ({ children }: Props) => {
  const [authProfile, setAuthProfile] = useState<ProfileDetailsType>(defaultProfile);

  const { selectedProfileId, authLoading } = useAuthUserContext();

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (selectedProfileId && !authLoading) {
        // the second argument is only necessary so the backend doesn't throw an error
        const { error, data } = await getProfileDetails(selectedProfileId, selectedProfileId);
        if (!error && data) {
          setAuthProfile(data);
        }
      }
    };
    fetchProfileDetails();
  }, [selectedProfileId, authLoading]);

  useEffect(() => {
    if (!selectedProfileId) {
      setAuthProfile(defaultProfile);
    }
  }, [selectedProfileId]);

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

  const removeFollowing = (profileId: number) => {
    setAuthProfile((prev) => {
      return {
        ...prev,
        following: prev?.following.filter((profile) => profile.id !== profileId),
        following_count: prev.following_count - 1,
      };
    });
  };

  const addFollowing = (profile: Profile) => {
    setAuthProfile((prev) => {
      return {
        ...prev,
        following: [...prev?.following, profile],
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
    updateProfileImage,
    updateAboutText,
    removeFollowing,
    addFollowing,
    updatePostsCount,
    updateName,
  };

  return <AuthProfileContext.Provider value={value}>{children}</AuthProfileContext.Provider>;
};

export default AuthProfileContextProvider;

export const useAuthProfileContext = () => {
  const {
    authProfile,
    updateProfileImage,
    updateAboutText,
    removeFollowing,
    addFollowing,
    updatePostsCount,
    updateName,
  } = useContext(AuthProfileContext);
  return {
    authProfile,
    updateProfileImage,
    updateAboutText,
    removeFollowing,
    addFollowing,
    updatePostsCount,
    updateName,
  };
};
