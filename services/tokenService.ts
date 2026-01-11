import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

import { refreshToken as refreshTokenAPI } from "@/api/auth";

// Token storage keys
const TOKEN_KEYS = {
  ACCESS: "ACCESS_TOKEN",
  REFRESH: "REFRESH_TOKEN",
} as const;

// Module-level state (shared singleton across all imports)
const accessTokenRef = { current: null as string | null };
const isRefreshingRef = { current: false };
const failedRequestsQueue: ((token: string | null) => void)[] = [];
const tokenLoadingPromiseRef = { current: null as Promise<string | null> | null };

/**
 * Get access token from cache or SecureStore
 * Uses promise coordination to prevent multiple simultaneous SecureStore reads
 */
export const getAccessToken = async (): Promise<string | null> => {
  // If cached, return immediately
  if (accessTokenRef.current) {
    return accessTokenRef.current;
  }

  // If another request is already loading the token, wait for it
  if (tokenLoadingPromiseRef.current) {
    return await tokenLoadingPromiseRef.current;
  }

  // Start loading the token and store the promise so other requests can await it
  tokenLoadingPromiseRef.current = SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
  const token = await tokenLoadingPromiseRef.current;

  // Cache it for subsequent requests
  accessTokenRef.current = token;

  // Clear the promise
  tokenLoadingPromiseRef.current = null;

  return token;
};

/**
 * Set access token in both cache and SecureStore
 * CRITICAL: Updates cache immediately so subsequent requests use new token
 * without waiting for SecureStore write to persist to disk
 */
export const setAccessToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, token);
  // Update cache immediately - this is critical for preventing race conditions
  accessTokenRef.current = token;
};

/**
 * Get refresh token from SecureStore
 */
export const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
};

/**
 * Set refresh token in SecureStore
 */
export const setRefreshToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, token);
};

/**
 * Clear all tokens from both SecureStore and cache
 */
export const clearTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
  await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
  accessTokenRef.current = null;
};

/**
 * Validate if refresh token is expired using JWT decode
 */
export const isRefreshTokenValid = (refreshToken: string): boolean => {
  try {
    const decodedToken = jwtDecode(refreshToken);
    const now = Date.now();
    return decodedToken?.exp ? decodedToken.exp * 1000 >= now : false;
  } catch {
    return false;
  }
};

/**
 * Main refresh token logic with queue management
 * Prevents multiple simultaneous refresh attempts by queueing concurrent requests
 * Returns the new access token on success, or null on failure
 */
export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ success: boolean; accessToken: string | null }> => {
  // If already refreshing, queue this request and wait for the result
  if (isRefreshingRef.current) {
    return new Promise((resolve) => {
      failedRequestsQueue.push((token: string | null) => {
        resolve({ success: !!token, accessToken: token });
      });
    });
  }

  // Mark that we're starting a refresh
  isRefreshingRef.current = true;

  try {
    // Validate refresh token is not expired
    if (!isRefreshTokenValid(refreshToken)) {
      isRefreshingRef.current = false;
      // Process queued requests with null token (will reject them)
      failedRequestsQueue.forEach((callback) => callback(null));
      failedRequestsQueue.length = 0;
      return { success: false, accessToken: null };
    }

    // Call refresh API
    const { error, data } = await refreshTokenAPI(refreshToken);

    if (data && !error) {
      const newAccessToken = data.access;
      await setAccessToken(newAccessToken);

      // Save the new refresh token (JWT token rotation)
      if (data.refresh) {
        await setRefreshToken(data.refresh);
      }

      // Process all queued requests with the new token
      failedRequestsQueue.forEach((callback) => callback(newAccessToken));
      failedRequestsQueue.length = 0;

      isRefreshingRef.current = false;
      return { success: true, accessToken: newAccessToken };
    } else {
      isRefreshingRef.current = false;
      // Process queued requests with null token (will reject them)
      failedRequestsQueue.forEach((callback) => callback(null));
      failedRequestsQueue.length = 0;
      return { success: false, accessToken: null };
    }
  } catch {
    // Handle any unexpected errors during refresh
    isRefreshingRef.current = false;
    failedRequestsQueue.forEach((callback) => callback(null));
    failedRequestsQueue.length = 0;
    return { success: false, accessToken: null };
  }
};
