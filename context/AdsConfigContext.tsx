/**
 * Context for managing ads configuration
 * Provides global access to ads enable/disable state
 */

import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useCallback, ReactNode } from "react";

import { getAdsConfig, AdsConfig } from "@/api/ads";

import { useAuthUserContext } from "./AuthUserContext";

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
  const { selectedProfileId } = useAuthUserContext();

  const adsConfigQuery = useQuery({
    queryKey: ["adsConfig"],
    queryFn: async () => {
      const { data, error } = await getAdsConfig();

      console.log("ADS Data: ", data);
      console.log("ADS Error: ", error);

      if (data) {
        return data;
      }

      // Log error but return default config (preserves original behavior)
      console.warn("Using default ads config due to error:", error);
      return DEFAULT_CONFIG;
    },
    enabled: !!selectedProfileId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - ads config rarely changes
  });

  // Use query data or fall back to default config
  const config = adsConfigQuery.data ?? DEFAULT_CONFIG;

  const refetchConfig = useCallback(async () => {
    await adsConfigQuery.refetch();
  }, [adsConfigQuery]);

  const value: AdsConfigContextType = {
    adsEnabled: config.enabled,
    defaultAdInterval: config.adInterval,
    isLoading: adsConfigQuery.isPending,
    error: adsConfigQuery.error?.message ?? null,
    refetchConfig,
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
