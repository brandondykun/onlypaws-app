import { createContext, useContext, useEffect, useState } from "react";

import { getProfileDetails } from "@/api/profile";
import { ProfileDetails as ProfileDetailsType, ProfileImage } from "@/types";

import { useAuthUserContext } from "./AuthUserContext";

type AuthProfileContextType = {
  authProfile: ProfileDetailsType;
  loading: boolean;
  updateProfileImage: (image: ProfileImage) => void;
  updateAboutText: (aboutText: string) => void;
  removeFollowing: () => void;
  addFollowing: () => void;
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
    is_following: false,
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
  },
  loading: false,
  updateProfileImage: (image: ProfileImage) => {},
  updateAboutText: (aboutText: string) => {},
  removeFollowing: () => {},
  addFollowing: () => {},
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
  is_following: false,
  posts_count: 0,
  followers_count: 0,
  following_count: 0,
};

const AuthProfileContextProvider = ({ children }: Props) => {
  const [authProfile, setAuthProfile] = useState<ProfileDetailsType>(defaultProfile);
  const [loading, setLoading] = useState(false);

  const { selectedProfileId, authLoading } = useAuthUserContext();

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (selectedProfileId && !authLoading) {
        setLoading(true);
        // the second argument is only necessary so the backend doesn't throw an error
        const { error, data } = await getProfileDetails(selectedProfileId, selectedProfileId);
        if (!error && data) {
          setAuthProfile(data);
        }
        setLoading(false);
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
  };
};
