/**
 * Custom hook for easily integrating ads into any list
 * Makes ad integration plug-and-play across the app
 */

import { useCallback, useEffect, useMemo } from "react";

import AdPost from "@/components/AdPost/AdPost";
import { useAdsConfig } from "@/context/AdsConfigContext";
import { adManager } from "@/services/ads/AdManager";
import { isAdItem, mergeAdsIntoPosts, PostOrAdItem } from "@/utils/adUtils";

type UseAdsInListOptions<T> = {
  /**
   * The array of items (e.g., posts) to merge ads into
   */
  items: T[];

  /**
   * Show an ad every N items (default: 6)
   */
  adInterval?: number;

  /**
   * Render function for non-ad items
   */
  renderItem: (item: T) => React.ReactElement;

  /**
   * Optional callback when items change (for additional preloading logic)
   */
  onItemsChange?: (items: T[], expectedAdCount: number) => void;
};

type UseAdsInListReturn = {
  /**
   * The merged array of items and ads ready for rendering
   */
  data: PostOrAdItem[];

  /**
   * Render function that handles both items and ads
   */
  renderItem: (params: { item: PostOrAdItem }) => React.ReactElement;

  /**
   * Key extractor for FlatList/FlashList
   */
  keyExtractor: (item: PostOrAdItem) => string;
};

/**
 * Hook to integrate ads into any list with automatic preloading
 *
 * @example
 * ```tsx
 * const { data, renderItem, keyExtractor } = useAdsInList({
 *   items: posts,
 *   adInterval: 6,
 *   renderItem: (post) => <Post post={post} />,
 * });
 *
 * return (
 *   <FlashList
 *     data={data}
 *     renderItem={renderItem}
 *     keyExtractor={keyExtractor}
 *   />
 * );
 * ```
 */
export function useAdsInList<T extends { id: number | string }>({
  items,
  adInterval = undefined,
  renderItem: renderItemProp,
  onItemsChange,
}: UseAdsInListOptions<T>): UseAdsInListReturn {
  const { adsEnabled, defaultAdInterval } = useAdsConfig();

  const adIntervalToUse = adInterval ?? defaultAdInterval;

  // Merge ads into the items list (only if ads are enabled)
  const data = useMemo<PostOrAdItem[]>(() => {
    if (!adsEnabled) {
      return items as any; // No ads - return items as-is
    }
    return mergeAdsIntoPosts(items as any, adIntervalToUse);
  }, [items, adIntervalToUse, adsEnabled]);

  // Preload ads when items change (only if ads are enabled)
  useEffect(() => {
    if (!adsEnabled || items.length === 0) return;

    const expectedAdCount = Math.floor(items.length / adIntervalToUse);

    // Get all ad IDs that will be needed
    const adIds = Array.from({ length: expectedAdCount }, (_, i) => `ad-${i}`);

    // Preload all expected ads
    adManager.preloadMultipleAds(adIds);

    // Call optional callback
    onItemsChange?.(items, expectedAdCount);
  }, [items, adIntervalToUse, onItemsChange, adsEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      adManager.clearCache();
    };
  }, []);

  // Render function that handles both items and ads
  const renderItem = useCallback(
    ({ item }: { item: PostOrAdItem }) => {
      // If ads are disabled, just render the item
      if (!adsEnabled) {
        return renderItemProp(item as unknown as T);
      }

      if (isAdItem(item)) {
        return <AdPost adId={item.id} />;
      }
      return renderItemProp(item as unknown as T);
    },
    [renderItemProp, adsEnabled],
  );

  // Key extractor
  const keyExtractor = useCallback((item: PostOrAdItem) => {
    return item.id.toString();
  }, []);

  return {
    data,
    renderItem,
    keyExtractor,
  };
}
