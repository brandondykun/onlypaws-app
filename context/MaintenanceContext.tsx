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

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";

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

export const MaintenanceProvider = ({ children }: MaintenanceProviderProps) => {
  const [state, setState] = useState<MaintenanceState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  // Track if we've already done initial check to avoid duplicate calls
  const hasCheckedRef = useRef(false);

  /**
   * Check system status from the backend.
   * Called early in app initialization.
   */
  const checkSystemStatus = useCallback(async () => {
    // Prevent duplicate calls during development strict mode or re-renders
    if (hasCheckedRef.current) {
      return;
    }
    hasCheckedRef.current = true;

    try {
      const { data, status } = await getSystemStatus();

      console.log("SYSTEM STATUS DATA: ", data);
      console.log("SYSTEM STATUS STATUS: ", status);

      if (data) {
        // Check if status is maintenance OR if we got a 503
        const isMaintenanceActive = data.status === "maintenance" || status === 503;

        setState({
          isInMaintenance: isMaintenanceActive,
          message: isMaintenanceActive ? data.message : null,
          estimatedEndTime: isMaintenanceActive ? data.estimated_end_time : null,
        });
      }
      // If data is null but no 503, system is likely operational or unreachable
      // We don't block the app for network errors on status check
    } catch (error) {
      // Log error but don't block app - maintenance mode is opt-in
      console.error("Error checking system status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Trigger maintenance mode manually (e.g., from 503 interceptor).
   * Used when any API call returns 503.
   */
  const triggerMaintenance = useCallback((response?: SystemStatusResponse) => {
    setState({
      isInMaintenance: true,
      message: response?.message ?? "The app is currently undergoing maintenance. Please try again later.",
      estimatedEndTime: response?.estimated_end_time ?? null,
    });
    setIsLoading(false);
  }, []);

  /**
   * Clear maintenance state to allow retry.
   * Called when user wants to retry after maintenance.
   */
  const clearMaintenance = useCallback(() => {
    hasCheckedRef.current = false;
    setState(DEFAULT_STATE);
  }, []);

  // Run initial status check on mount
  useEffect(() => {
    checkSystemStatus();
  }, [checkSystemStatus]);

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
