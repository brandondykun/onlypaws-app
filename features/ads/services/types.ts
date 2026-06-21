/**
 * Platform-agnostic ad types
 * These types abstract away the specific ad platform implementation
 */

export enum AdType {
  NATIVE = "native",
  BANNER = "banner",
}

export interface AdData {
  id: string;
  type: AdType;
  headline?: string;
  body?: string;
  advertiser?: string;
  images?: string[];
  icon?: string;
  callToAction?: string;
}

export interface AdServiceConfig {
  androidAppId?: string;
  iosAppId?: string;
  testMode?: boolean;
}

/**
 * Platform-agnostic ad service interface
 * Any ad platform implementation should conform to this interface
 */
export interface IAdService {
  /**
   * Initialize the ad service
   */
  initialize(config: AdServiceConfig): Promise<void>;

  /**
   * Get native ad unit ID for the current platform
   */
  getNativeAdUnitId(): string;

  /**
   * Check if ads are ready to be shown
   */
  isInitialized(): boolean;
}
