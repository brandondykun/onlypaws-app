import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { useAuthUserContext } from "@/context/AuthUserContext";

import { refreshToken } from "../api/auth";
import { axiosInstance } from "../api/config";

type Props = {
  children: React.ReactNode;
};

const AuthInterceptor = ({ children }: Props) => {
  const { isAuthenticated, logOut } = useAuthUserContext();
  const { authProfile, loading } = useAuthProfileContext();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Add a response interceptor
      const authInterceptor = axiosInstance.interceptors.response.use(
        function (response) {
          // Any status code that lie within the range of 2xx cause this function to trigger
          // Do something with response data
          return response;
        },
        async function (error) {
          const config = error?.config;
          // Any status codes that falls outside the range of 2xx cause this function to trigger
          // Do something with response error
          if (error.response.status === 401 && !config._retry) {
            config._retry = true;
            // access token is expired
            // try to refresh the token
            const storedRefreshToken = await SecureStore.getItemAsync("REFRESH_TOKEN");
            if (storedRefreshToken) {
              const decodedToken = jwtDecode(storedRefreshToken);
              const now = Date.now();
              if (decodedToken?.exp && decodedToken.exp * 1000 < now) {
                // if refresh token is expired, log user out
                console.log("CALLING LOGOUT FROM AUTH INTERCEPTOR 1");
                logOut();
              } else {
                const { error, data } = await refreshToken(storedRefreshToken);
                if (data && !error) {
                  const newAccessToken = data.access;
                  await SecureStore.setItemAsync("ACCESS_TOKEN", newAccessToken);
                  config.headers.Authorization = `Bearer ${newAccessToken}`;
                } else {
                  console.log("CALLING LOGOUT FROM AUTH INTERCEPTOR 2");
                  logOut();
                }
              }
            }
            return axiosInstance(config);
          }

          return Promise.reject(error);
        },
      );

      return () => {
        axiosInstance.interceptors.request.eject(authInterceptor);
      };
    }
  }, [isAuthenticated, logOut, router]);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      async function (config) {
        // Do something before request is sent
        const accessToken = await SecureStore.getItemAsync("ACCESS_TOKEN");
        config.headers.Authorization = `Bearer ${accessToken}`;
        // attach selected profile id to each request
        config.headers["AUTH-PROFILE-ID"] = authProfile.id;
        return config;
      },
      function (error) {
        // Do something with request error
        return Promise.reject(error);
      },
    );
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [isAuthenticated, logOut, authProfile]);

  // without this check, requests will be made before the auth profile is set in the auth interceptor
  // it will result in several 401's and cause multiple requests to be retried
  if (loading) {
    return null;
  }

  return children;
};

export default AuthInterceptor;
