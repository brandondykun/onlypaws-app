/**
 * Ad Manager for preloading and caching native ads
 * This improves perceived performance by loading ads before they're needed
 */

import { NativeAd, NativeMediaAspectRatio } from "react-native-google-mobile-ads";

import { adService } from "./adService";

type AdCacheItem = {
  ad: NativeAd;
  timestamp: number;
};

const AD_KEYWORDS = [
  "pets",
  "dogs",
  "cats",
  "animals",
  "pet care",
  "pet food",
  "pet products",
  "pet services",
  "pet training",
  "pet grooming",
  "pet adoption",
  "pet insurance",
  "pet care products",
  "pet care services",
  "pet care training",
  "pet care grooming",
  "pet care adoption",
  "pet care insurance",
];

class AdManager {
  private adCache: Map<string, AdCacheItem> = new Map();
  private loadingAds: Map<string, Promise<void>> = new Map(); // Changed to Map to store promises
  private readonly MAX_CACHE_SIZE = 15; // Increased from 5 to handle more preloading
  private readonly MAX_AD_AGE_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Preload an ad for a specific position in the list
   * @param adId - Unique identifier for this ad position
   */
  async preloadAd(adId: string): Promise<void> {
    // Don't preload if already cached
    if (this.adCache.has(adId)) {
      return;
    }

    // If already loading, wait for it
    if (this.loadingAds.has(adId)) {
      await this.loadingAds.get(adId);
      return;
    }

    // Don't preload if service not initialized
    if (!adService.isInitialized()) {
      console.warn("Ad service not initialized, skipping preload");
      return;
    }

    // Create loading promise
    const loadPromise = (async () => {
      try {
        const ad = await NativeAd.createForAdRequest(adService.getNativeAdUnitId(), {
          requestNonPersonalizedAdsOnly: false,
          keywords: AD_KEYWORDS,
          aspectRatio: NativeMediaAspectRatio.SQUARE,
        });

        // Clean up old ads if cache is full
        if (this.adCache.size >= this.MAX_CACHE_SIZE) {
          this.cleanOldestAd();
        }

        this.adCache.set(adId, {
          ad,
          timestamp: Date.now(),
        });

        console.log(`Preloaded ad: ${adId}`);
      } catch (error) {
        console.log(`Failed to preload ad ${adId}:`, error);
        // Preload failures are non-critical - ads will load on-demand via getAd()
      } finally {
        this.loadingAds.delete(adId);
      }
    })();

    this.loadingAds.set(adId, loadPromise);
    await loadPromise;
  }

  /**
   * Get a preloaded ad or load it on demand
   * @param adId - Unique identifier for this ad position
   */
  async getAd(adId: string): Promise<NativeAd | null> {
    // If ad is currently loading, wait for it
    if (this.loadingAds.has(adId)) {
      console.log(`Waiting for ad to finish loading: ${adId}`);
      await this.loadingAds.get(adId);
    }

    const cached = this.adCache.get(adId);

    // Return cached ad if it exists and isn't too old
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.MAX_AD_AGE_MS) {
        console.log(`Using cached ad: ${adId}`);
        // Keep in cache so it can be reused when scrolling back
        return cached.ad;
      } else {
        // Ad is too old, destroy it
        cached.ad.destroy();
        this.adCache.delete(adId);
      }
    }

    // If not cached and not loading, load it now
    console.log(`Loading ad on demand: ${adId}`);
    return this.loadAdNow(adId);
  }

  /**
   * Load an ad immediately
   */
  private async loadAdNow(adId: string): Promise<NativeAd | null> {
    if (!adService.isInitialized()) {
      return null;
    }

    try {
      const ad = await NativeAd.createForAdRequest(adService.getNativeAdUnitId(), {
        requestNonPersonalizedAdsOnly: false,
        keywords: AD_KEYWORDS,
        aspectRatio: NativeMediaAspectRatio.SQUARE,
      });

      // Cache the ad so it can be reused when scrolling
      this.adCache.set(adId, {
        ad,
        timestamp: Date.now(),
      });

      return ad;
    } catch (error) {
      console.warn(`Failed to load ad ${adId}:`, error);
      // Return null to gracefully handle ad load failures
      return null;
    }
  }

  /**
   * Preload multiple ads at once
   * @param adIds - Array of ad IDs to preload
   * @param sequential - If true, load ads one by one instead of in parallel (default: false)
   */
  async preloadMultipleAds(adIds: string[], sequential = false): Promise<void> {
    if (sequential) {
      // Load ads one at a time to avoid overwhelming the ad network
      for (const id of adIds) {
        await this.preloadAd(id);
      }
    } else {
      // Load all ads in parallel for speed
      await Promise.all(adIds.map((id) => this.preloadAd(id)));
    }
  }

  /**
   * Clean up the oldest ad in the cache
   */
  private cleanOldestAd(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, value] of this.adCache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const item = this.adCache.get(oldestKey);
      if (item) {
        item.ad.destroy();
      }
      this.adCache.delete(oldestKey);
      console.log(`Cleaned old ad: ${oldestKey}`);
    }
  }

  /**
   * Clear all cached ads (call when leaving screen)
   */
  clearCache(): void {
    for (const item of this.adCache.values()) {
      item.ad.destroy();
    }
    this.adCache.clear();
    // Wait for any loading ads to complete before clearing
    this.loadingAds.clear();
    console.log("Ad cache cleared");
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return {
      cached: this.adCache.size,
      loading: this.loadingAds.size,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }
}

// Export singleton instance
export const adManager = new AdManager();
