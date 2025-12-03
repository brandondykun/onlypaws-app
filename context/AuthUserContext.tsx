import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getMyInfo } from "@/api/auth";
import * as tokenService from "@/services/tokenService";
import { MyInfo, ProfileOption, User } from "@/types";

const DEFAULT_USER: User = {
  id: null,
  email: null,
  profiles: null,
  is_email_verified: false,
  regular_profile_onboarding_completed: false,
  business_profile_onboarding_completed: false,
};

type AuthUserContextType = {
  user: User;
  selectedProfileId: number | null;
  authenticate: (user: MyInfo) => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  logOut: () => Promise<void>;
  setActiveProfileId: (id: number) => void;
  profileOptions: ProfileOption[] | null;
  addProfileOption: (option: ProfileOption) => void;
  changeSelectedProfileId: (profileId: number) => Promise<void>;
  updateEmailVerified: (value: boolean) => void;
  updateOnboardingCompleted: (profileType: "regular" | "business") => void;
  removeProfileOption: (profileId: number) => void;
  changeEmail: (newEmail: string) => void;
};

const AuthUserContext = createContext<AuthUserContextType>({
  user: DEFAULT_USER,
  selectedProfileId: null,
  authenticate: (user: MyInfo) => {},
  isAuthenticated: false,
  authLoading: true,
  logOut: () => Promise.resolve(),
  setActiveProfileId: (id: number) => {},
  profileOptions: null,
  addProfileOption: (option: ProfileOption) => {},
  changeSelectedProfileId: (profileId: number) => Promise.resolve(),
  updateEmailVerified: (value: boolean) => {},
  updateOnboardingCompleted: (profileType: "regular" | "business") => {},
  removeProfileOption: (profileId: number) => {},
  changeEmail: (newEmail: string) => {},
});

type Props = {
  children: React.ReactNode;
};

const AuthUserContextProvider = ({ children }: Props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[] | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading) {
      // set quick timeout to prevent flash of loading screen in app/_layout.tsx
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 10);
    }
  }, [authLoading]);

  const authenticate = useCallback(async (user: MyInfo) => {
    setUser(user);
    setProfileOptions(user.profiles);
    setIsAuthenticated(true);

    // Only set profile if user has profiles
    if (user.profiles && user.profiles.length > 0) {
      // fetch last active profile id and set as the current active profile - persist last profile
      const selectedId = await SecureStore.getItemAsync("SELECTED_PROFILE_ID");
      if (selectedId && user.profiles.find((profile) => profile.id === Number(selectedId))) {
        setSelectedProfileId(Number(selectedId));
      } else {
        // as a default, set first profile as active
        setSelectedProfileId(user.profiles[0].id);
      }
    }
  }, []);

  const logOut = useCallback(async () => {
    setUser(DEFAULT_USER);
    setSelectedProfileId(null);
    setIsAuthenticated(false);
    await tokenService.clearTokens();
    // clear the query client to remove all queries
    queryClient.clear();
    router.replace("/auth/login");
  }, [router, queryClient]);

  const changeSelectedProfileId = async (profileId: number) => {
    // No need to clear cache - query keys include selectedProfileId
    // so React Query will automatically treat this as a new query
    // save new selected profile id to persist profile selection between sessions
    await SecureStore.setItemAsync("SELECTED_PROFILE_ID", profileId.toString());
    setSelectedProfileId(profileId);
  };

  const updateEmailVerified = (value: boolean) => {
    setUser((prev) => {
      return { ...prev, is_email_verified: value };
    });
  };

  const updateOnboardingCompleted = (profileType: "regular" | "business") => {
    setUser((prev) => {
      return {
        ...prev,
        regular_profile_onboarding_completed:
          profileType === "regular" ? true : prev.regular_profile_onboarding_completed,
        business_profile_onboarding_completed:
          profileType === "business" ? true : prev.business_profile_onboarding_completed,
      };
    });
  };

  useEffect(() => {
    // check for stored refresh token on app load - if token present
    // use token to automatically log the user in
    const persistLogin = async () => {
      const storedRefreshToken = await tokenService.getRefreshToken();

      if (storedRefreshToken) {
        const { success, accessToken } = await tokenService.refreshAccessToken(storedRefreshToken);
        if (success && accessToken) {
          const { data: myInfoData, error: myInfoError } = await getMyInfo();
          if (myInfoData && !myInfoError) {
            authenticate(myInfoData);
            //redirect to app
          }
        } else {
          console.log("CALLING LOGOUT FROM AUTH USER CONTEXT PROVIDER");
          logOut();
        }
      }
      setAuthLoading(false);
    };
    persistLogin();
  }, [authenticate, logOut]);

  const setActiveProfileId = (id: number) => {
    setSelectedProfileId(id);
  };

  const addProfileOption = (option: ProfileOption) => {
    setProfileOptions((prev) => {
      if (prev) {
        return [...prev, option];
      }
      return [option];
    });
    // Also update the user.profiles array so layout checks work correctly
    setUser((prev) => {
      const currentProfiles = prev.profiles || [];
      return { ...prev, profiles: [...currentProfiles, option] };
    });
  };

  // remove profile option if a profile if deleted
  const removeProfileOption = (profileId: number) => {
    setProfileOptions((prev) => {
      if (prev) {
        return prev?.filter((profile) => profile.id !== profileId);
      }
      return null;
    });
    // Also update the user.profiles array to keep in sync
    setUser((prev) => {
      const currentProfiles = prev.profiles || [];
      const filtered = currentProfiles.filter((profile) => profile.id !== profileId);
      return { ...prev, profiles: filtered.length > 0 ? filtered : null };
    });
  };

  const changeEmail = (newEmail: string) => {
    setUser((prev) => {
      return { ...prev, email: newEmail };
    });
  };

  const value = {
    user,
    selectedProfileId,
    authenticate,
    isAuthenticated,
    authLoading,
    logOut,
    setActiveProfileId,
    profileOptions,
    addProfileOption,
    changeSelectedProfileId,
    updateEmailVerified,
    updateOnboardingCompleted,
    removeProfileOption,
    changeEmail,
  };

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>;
};

export default AuthUserContextProvider;

export const useAuthUserContext = () => {
  const context = useContext(AuthUserContext);
  if (!context) {
    throw new Error("useAuthUserContext must be used within AuthUserContextProvider");
  }
  return context;
};
