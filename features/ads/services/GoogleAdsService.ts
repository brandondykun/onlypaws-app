/**
 * Google Mobile Ads implementation of the ad service
 * This file contains all Google-specific code and can be replaced with another provider
 */

import { Platform } from "react-native";
import mobileAds, { MaxAdContentRating, TestIds } from "react-native-google-mobile-ads";

import { IAdService, AdServiceConfig } from "./types";

class GoogleAdsService implements IAdService {
  private initialized = false;
  private testMode = false;
  private nativeAdUnitId = "";

  async initialize(config: AdServiceConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.testMode = config.testMode ?? __DEV__;

      // Initialize Google Mobile Ads
      await mobileAds().initialize();

      // Configure ads settings
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      // Set ad unit IDs based on platform and test mode
      if (this.testMode) {
        // Use Google's test ad unit IDs
        this.nativeAdUnitId =
          Platform.select({
            ios: TestIds.NATIVE, // Google test native ad unit
            android: TestIds.NATIVE, // Google test native ad unit
          }) || "";
      } else {
        // App id's are pulled from the config in app/_layout.tsx
        this.nativeAdUnitId =
          Platform.select({
            ios: config.iosAppId,
            android: config.androidAppId,
          }) || "";
      }

      this.initialized = true;
      console.log("Google Ads initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Google Ads:", error);
      throw error;
    }
  }

  getNativeAdUnitId(): string {
    return this.nativeAdUnitId;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const googleAdsService = new GoogleAdsService();
