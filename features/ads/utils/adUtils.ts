/**
 * Utility functions for working with ads in lists
 */

import { PostDetailed } from "@/types";

export type AdItem = {
  id: string;
  type: "ad";
};

export type PostOrAdItem = PostDetailed | AdItem;

/**
 * Type guard to check if an item is an ad
 */
export function isAdItem(item: PostOrAdItem): item is AdItem {
  return "type" in item && item.type === "ad";
}

/**
 * Type guard to check if an item is a post
 */
export function isPostItem(item: PostOrAdItem): item is PostDetailed {
  return !isAdItem(item);
}

/**
 * Merges ads into a list of posts at regular intervals
 *
 * @param posts - Array of posts
 * @param adInterval - Insert an ad every N posts (default: 6)
 * @returns Array of posts with ads interspersed
 */
export function mergeAdsIntoPosts(posts: PostDetailed[], adInterval: number = 6): PostOrAdItem[] {
  if (posts.length === 0) {
    return [];
  }

  const result: PostOrAdItem[] = [];
  let adCounter = 0;

  posts.forEach((post, index) => {
    result.push(post);

    // Insert ad after every adInterval posts (but not after the last post)
    if ((index + 1) % adInterval === 0 && index < posts.length - 1) {
      result.push({
        id: `ad-${adCounter}`,
        type: "ad",
      });
      adCounter++;
    }
  });

  return result;
}

/**
 * Get the number of ads that should be shown for a given number of posts
 *
 * @param postCount - Total number of posts
 * @param adInterval - Ad appears every N posts
 * @returns Number of ads to show
 */
export function getAdCount(postCount: number, adInterval: number = 6): number {
  if (postCount <= adInterval) {
    return 0;
  }
  return Math.floor((postCount - 1) / adInterval);
}
