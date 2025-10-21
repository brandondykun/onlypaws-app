// import { Redirect } from "expo-router";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getMyInfo } from "@/api/auth";
import * as tokenService from "@/services/tokenService";
import { MyInfo, ProfileOption, User } from "@/types";

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
  removeProfileOption: (profileId: number) => void;
  changeEmail: (newEmail: string) => void;
};

const AuthUserContext = createContext<AuthUserContextType>({
  user: { id: null, email: null, profiles: null, is_email_verified: false },
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
  removeProfileOption: (profileId: number) => {},
  changeEmail: (newEmail: string) => {},
});

type Props = {
  children: React.ReactNode;
};

const AuthUserContextProvider = ({ children }: Props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User>({ id: null, email: null, profiles: null, is_email_verified: false });
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[] | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      SplashScreen.hideAsync();
    }
  }, [authLoading]);

  const authenticate = useCallback(async (user: MyInfo) => {
    setUser(user);
    setProfileOptions(user.profiles);
    setIsAuthenticated(true);
    // fetch last active profile id and set as the current active profile - persist last profile
    const selectedId = await SecureStore.getItemAsync("SELECTED_PROFILE_ID");
    if (selectedId && user.profiles.find((profile) => profile.id === Number(selectedId))) {
      setSelectedProfileId(Number(selectedId));
    } else {
      // as a default, set first profile as active
      setSelectedProfileId(user.profiles[0].id);
    }
  }, []);

  const logOut = useCallback(async () => {
    setUser({ id: null, email: null, profiles: null, is_email_verified: false });
    setSelectedProfileId(null);
    setIsAuthenticated(false);
    await tokenService.clearTokens();
    router.replace("/auth/login");
  }, [router]);

  const changeSelectedProfileId = async (profileId: number) => {
    // save new selected profile id to persist profile selection between sessions
    await SecureStore.setItemAsync("SELECTED_PROFILE_ID", profileId.toString());
    setSelectedProfileId(profileId);
  };

  const updateEmailVerified = (value: boolean) => {
    setUser((prev) => {
      return { ...prev, is_email_verified: value };
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
          // return <Redirect href="/auth/" />;
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
  };

  // remove profile option if a profile if deleted
  const removeProfileOption = (profileId: number) => {
    setProfileOptions((prev) => {
      if (prev) {
        return prev?.filter((profile) => profile.id !== profileId);
      }
      return null;
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
    removeProfileOption,
    changeEmail,
  };

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>;
};

export default AuthUserContextProvider;

export const useAuthUserContext = () => {
  const {
    user,
    authenticate,
    selectedProfileId,
    isAuthenticated,
    authLoading,
    logOut,
    setActiveProfileId,
    profileOptions,
    addProfileOption,
    changeSelectedProfileId,
    updateEmailVerified,
    removeProfileOption,
    changeEmail,
  } = useContext(AuthUserContext);
  return {
    user,
    authenticate,
    selectedProfileId,
    isAuthenticated,
    authLoading,
    logOut,
    setActiveProfileId,
    profileOptions,
    addProfileOption,
    changeSelectedProfileId,
    updateEmailVerified,
    removeProfileOption,
    changeEmail,
  };
};
