/**
 * API calls for system status
 */

import axios, { AxiosError } from "axios";

import { SystemStatusResponse } from "@/types/status/status";

import { BASE_URL } from "./config";

/**
 * Fetch system status from backend - used to display a maintenance message to the user.
 * This endpoint should be called early in app initialization to check for maintenance mode.
 *
 * NOTE: Uses plain axios (not axiosInstance) because:
 * 1. The status endpoint is public and doesn't require authentication
 * 2. This call happens before AuthInterceptor sets up the auth headers
 * 3. We want to check maintenance status even when the user isn't logged in
 *
 * @returns SystemStatusResponse with status, message, and estimated_end_time
 */
export const getSystemStatus = async (): Promise<{
  data: SystemStatusResponse | null;
  error: string | null;
  status: number | null;
}> => {
  try {
    const url = `${BASE_URL}/v1/config/status/`;
    const response = await axios.get<SystemStatusResponse>(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "mobile",
      },
    });
    return { data: response.data, error: null, status: response.status };
  } catch (err) {
    const error = err as AxiosError<SystemStatusResponse>;

    // If we get a 503, the server is in maintenance mode and may include status info
    if (error.response?.status === 503 && error.response?.data) {
      return {
        data: error.response.data,
        error: null,
        status: 503,
      };
    }

    return {
      data: null,
      error: error.message || "Failed to fetch system status",
      status: error.response?.status ?? null,
    };
  }
};
