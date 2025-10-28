/**
 * Main ad service export
 * To switch ad platforms, simply swap the implementation here
 */

import { googleAdsService } from "./GoogleAdsService";

// Export the current ad service implementation
// To switch to a different provider (e.g., Facebook Ads, Unity Ads),
// create a new service class that implements IAdService and export it here instead
export const adService = googleAdsService;

// Re-export types for convenience
export * from "./types";
