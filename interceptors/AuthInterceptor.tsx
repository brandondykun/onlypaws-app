import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useAuthUserContext } from "@/context/AuthUserContext";
import { useMaintenance } from "@/context/MaintenanceContext";
import * as tokenService from "@/services/tokenService";
import { SystemStatusResponse } from "@/types/status/status";

import { axiosInstance } from "../api/config";

type Props = {
  children: React.ReactNode;
};

const AuthInterceptor = ({ children }: Props) => {
  const { logOut, selectedProfilePublicId: selectedProfileId } = useAuthUserContext();
  const { triggerMaintenance, isInMaintenance } = useMaintenance();
  const router = useRouter();

  useEffect(() => {
    // Set up interceptors immediately, regardless of auth status
    // This ensures they're active before any requests from contexts fire
    // Add a response interceptor
    const responseInterceptor = axiosInstance.interceptors.response.use(
      function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
      },
      async function (error) {
        const config = error?.config;
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error

        // Handle 503 Service Unavailable (maintenance mode)
        if (error.response?.status === 503) {
          // Extract maintenance info from response if available
          const maintenanceData = error.response?.data as SystemStatusResponse | undefined;
          triggerMaintenance(maintenanceData);
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !config._retry) {
          config._retry = true;

          try {
            // access token is expired - try to refresh the token
            const storedRefreshToken = await tokenService.getRefreshToken();
            if (storedRefreshToken) {
              // refreshAccessToken handles queuing internally if a refresh is already in progress
              // This prevents race conditions when multiple 401s happen simultaneously
              const { success, accessToken } = await tokenService.refreshAccessToken(storedRefreshToken);
              if (success && accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(config);
              } else {
                // Don't logout if the app is in maintenance mode - the failure is due to 503, not auth
                if (!isInMaintenance) {
                  console.log("CALLING LOGOUT FROM AUTH INTERCEPTOR");
                  logOut();
                }
                return Promise.reject(error);
              }
            } else {
              // No refresh token available
              return Promise.reject(error);
            }
          } catch (err) {
            // Handle any unexpected errors during refresh
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [logOut, router, triggerMaintenance, isInMaintenance]);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      async function (config) {
        // Get token from cache or SecureStore (with automatic promise coordination)
        const accessToken = await tokenService.getAccessToken();

        // Attach token and profile ID to request
        // Use selectedProfileId instead of authProfile.id to avoid stale profile ID
        // during profile switches (selectedProfileId updates immediately, authProfile needs to be fetched)
        config.headers.Authorization = `Bearer ${accessToken}`;
        config.headers["AUTH-PROFILE-ID"] = selectedProfileId;
        return config;
      },
      function (error) {
        return Promise.reject(error);
      },
    );
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [selectedProfileId]);

  return children;
};

export default AuthInterceptor;
