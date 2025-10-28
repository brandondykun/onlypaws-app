/**
 * API calls for ad configuration
 */

import { axiosFetch } from "./config";

export type AdsConfig = {
  enabled: boolean;
  adInterval: number; // Default interval (can be overridden per-screen)
};

/**
 * Fetch ads configuration from backend
 * This allows remote control of ad display
 */
export const getAdsConfig = async () => {
  const url = "/v1/config/ads/";
  return await axiosFetch<AdsConfig>(url);
};
