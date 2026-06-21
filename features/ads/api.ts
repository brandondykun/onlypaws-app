/**
 * API calls for ad configuration
 */

import { axiosFetch } from "@/api/config";

import { AdsConfig } from "./types";

/**
 * Fetch ads configuration from backend
 * This allows remote control of ad display
 */
export const getAdsConfig = async () => {
  const url = "/v1/config/ads/";
  return await axiosFetch<AdsConfig>(url);
};
