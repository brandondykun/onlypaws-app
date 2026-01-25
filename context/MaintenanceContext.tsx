/**
 * Context for managing app maintenance mode state.
 * Provides global access to maintenance status and handles:
 * - Initial status check on app startup
 * - 503 responses from any API call (via AuthInterceptor)
 *
 * This provider should be placed above AuthUserContextProvider in the component tree.
 * It blocks children from rendering until the status check completes, and when in
 * maintenance mode, it only renders the MaintenanceModal (not the app).
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";

import { getSystemStatus } from "@/api/status";
import MaintenanceModal from "@/components/MaintenanceModal/MaintenanceModal";
import { SystemStatusResponse } from "@/types/status/status";

type MaintenanceState = {
  isInMaintenance: boolean;
  message: string | null;
  estimatedEndTime: string | null;
};

type MaintenanceContextType = MaintenanceState & {
  /** Check system status - called on app init */
  checkSystemStatus: () => Promise<void>;
  /** Trigger maintenance mode from interceptor (503 response) */
  triggerMaintenance: (response?: SystemStatusResponse) => void;
  /** Clear maintenance state (for retry scenarios) */
  clearMaintenance: () => void;
  /** Whether initial status check is loading */
  isLoading: boolean;
};

const DEFAULT_STATE: MaintenanceState = {
  isInMaintenance: false,
  message: null,
  estimatedEndTime: null,
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

type MaintenanceProviderProps = {
  children: ReactNode;
};

const MAINTENANCE_QUERY_KEY = ["systemStatus"];

export const MaintenanceProvider = ({ children }: MaintenanceProviderProps) => {
  const queryClient = useQueryClient();

  // Manual override state for when triggerMaintenance is called from interceptor
  // This takes precedence over query data since 503 responses can come from any API call
  const [manualOverride, setManualOverride] = useState<MaintenanceState | null>(null);

  // Query for initial system status check
  const systemStatusQuery = useQuery({
    queryKey: MAINTENANCE_QUERY_KEY,
    queryFn: async () => {
      const { data, status } = await getSystemStatus();

      if (data) {
        const isMaintenanceActive = data.status === "maintenance" || status === 503;
        return {
          isInMaintenance: isMaintenanceActive,
          message: isMaintenanceActive ? data.message : null,
          estimatedEndTime: isMaintenanceActive ? data.estimated_end_time : null,
        };
      }

      // If data is null, system is likely operational or unreachable
      // We don't block the app for network errors on status check
      return DEFAULT_STATE;
    },
    staleTime: 1000 * 60 * 5, // Consider stale after 5 minutes
    retry: false, // Don't retry on failure - we don't want to block the app
  });

  // Compute the final maintenance state: manual override takes precedence
  const state: MaintenanceState = useMemo(() => {
    if (manualOverride) {
      return manualOverride;
    }
    return systemStatusQuery.data ?? DEFAULT_STATE;
  }, [manualOverride, systemStatusQuery.data]);

  // Loading is true only during initial fetch (not re-fetches)
  const isLoading = systemStatusQuery.isPending;

  /**
   * Check system status from the backend.
   * Triggers a refetch of the query.
   */
  const checkSystemStatus = useCallback(async () => {
    // Refetch first, then clear manual override so fresh query data takes effect
    await systemStatusQuery.refetch();
    setManualOverride(null);
  }, [systemStatusQuery]);

  /**
   * Trigger maintenance mode manually (e.g., from 503 interceptor).
   * Used when any API call returns 503.
   */
  const triggerMaintenance = useCallback((response?: SystemStatusResponse) => {
    setManualOverride({
      isInMaintenance: true,
      message: response?.message ?? "The app is currently undergoing maintenance. Please try again later.",
      estimatedEndTime: response?.estimated_end_time ?? null,
    });
  }, []);

  /**
   * Clear maintenance state to allow retry.
   * Called when user wants to retry after maintenance.
   */
  const clearMaintenance = useCallback(() => {
    setManualOverride(null);
    // Invalidate the query so it refetches on next check
    queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEY });
  }, [queryClient]);

  const value: MaintenanceContextType = {
    ...state,
    checkSystemStatus,
    triggerMaintenance,
    clearMaintenance,
    isLoading,
  };

  // Block children until we know the maintenance status.
  // This prevents AuthUserContext from running persistLogin before we know
  // if the app is in maintenance mode, which would cause unnecessary logouts.
  // The splash screen remains visible during this brief check.
  if (isLoading) {
    return <MaintenanceContext.Provider value={value}>{null}</MaintenanceContext.Provider>;
  }

  // When in maintenance mode, only render the maintenance modal.
  // This completely blocks the app from mounting (including auth flows),
  // preventing any API calls or logouts during maintenance.
  // When maintenance ends and user clicks "Check Again", the app mounts fresh.
  if (state.isInMaintenance) {
    return (
      <MaintenanceContext.Provider value={value}>
        <MaintenanceModal />
      </MaintenanceContext.Provider>
    );
  }

  // System is operational - render the app normally
  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
};

/**
 * Hook to access maintenance mode state and actions.
 * Must be used within MaintenanceProvider.
 */
export const useMaintenance = (): MaintenanceContextType => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error("useMaintenance must be used within MaintenanceProvider");
  }
  return context;
};
