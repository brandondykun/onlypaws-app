/**
 * Context for managing ads configuration
 * Provides global access to ads enable/disable state
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

import { getAdsConfig, AdsConfig } from "@/api/ads";

import { useAuthProfileContext } from "./AuthProfileContext";

type AdsConfigContextType = {
  adsEnabled: boolean;
  defaultAdInterval: number;
  isLoading: boolean;
  error: string | null;
  refetchConfig: () => Promise<void>;
};

const AdsConfigContext = createContext<AdsConfigContextType | undefined>(undefined);

// Default fallback config (used if backend call fails)
const DEFAULT_CONFIG: AdsConfig = {
  enabled: true, // Enable ads by default
  adInterval: 6,
};

type AdsConfigProviderProps = {
  children: ReactNode;
};

export const AdsConfigProvider = ({ children }: AdsConfigProviderProps) => {
  const { authProfile } = useAuthProfileContext();
  const [config, setConfig] = useState<AdsConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!authProfile.id) return;

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await getAdsConfig();

    if (data) {
      setConfig(data);
    } else {
      setError(fetchError);
      console.warn("Using default ads config due to error:", fetchError);
      // Keep using default config on error
    }

    setIsLoading(false);
  }, [authProfile.id]);

  // Fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const value: AdsConfigContextType = {
    adsEnabled: config.enabled,
    defaultAdInterval: config.adInterval,
    isLoading,
    error,
    refetchConfig: fetchConfig,
  };

  return <AdsConfigContext.Provider value={value}>{children}</AdsConfigContext.Provider>;
};

/**
 * Hook to access ads configuration
 */
export const useAdsConfig = (): AdsConfigContextType => {
  const context = useContext(AdsConfigContext);
  if (!context) {
    throw new Error("useAdsConfig must be used within AdsConfigProvider");
  }
  return context;
};
