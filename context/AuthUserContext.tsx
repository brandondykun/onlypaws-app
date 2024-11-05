import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getMyInfo, refreshToken } from "@/api/auth";
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
};

const AuthUserContext = createContext<AuthUserContextType>({
  user: { id: null, email: null, profiles: null },
  selectedProfileId: null,
  authenticate: (user: MyInfo) => {},
  isAuthenticated: false,
  authLoading: true,
  logOut: () => Promise.resolve(),
  setActiveProfileId: (id: number) => {},
  profileOptions: null,
  addProfileOption: (option: ProfileOption) => {},
});

type Props = {
  children: React.ReactNode;
};

const AuthUserContextProvider = ({ children }: Props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User>({ id: null, email: null, profiles: null });
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[] | null>(null);

  const authenticate = useCallback((user: MyInfo) => {
    setUser(user);
    setSelectedProfileId(user.profiles[0].id);
    setProfileOptions(user.profiles);
    setIsAuthenticated(true);
  }, []);

  const logOut = useCallback(async () => {
    setUser({ id: null, email: null, profiles: null });
    setSelectedProfileId(null);
    setIsAuthenticated(false);
    await SecureStore.deleteItemAsync("REFRESH_TOKEN");
    await SecureStore.deleteItemAsync("ACCESS_TOKEN");
  }, []);

  useEffect(() => {
    // check for stored refresh token on app load - if token present
    // use token to automatically log the user in
    const persistLogin = async () => {
      const storedRefreshToken = await SecureStore.getItemAsync("REFRESH_TOKEN");

      if (storedRefreshToken) {
        const { error, data } = await refreshToken(storedRefreshToken);
        if (data && !error) {
          await SecureStore.setItemAsync("ACCESS_TOKEN", data.access);
          const { data: myInfoData, error: myInfoError } = await getMyInfo();
          if (myInfoData && !myInfoError) {
            authenticate(myInfoData);
            //redirect to app
          }
        } else {
          console.log("CALLING LOGOUT FROM AUTH USER CONTEXT PROVIDER");
          logOut();
          return <Redirect href="/auth/" />;
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
  };
};
