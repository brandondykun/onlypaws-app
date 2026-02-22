/**
 * Renders children or the maintenance modal based on MaintenanceContext.
 * Must be used inside MaintenanceProvider. This component exists to avoid
 * a require cycle: MaintenanceContext does not import MaintenanceModal;
 * MaintenanceGate imports both and handles the branching.
 */

import React, { ReactNode } from "react";

import { useMaintenance } from "@/context/MaintenanceContext";

import MaintenanceModal from "../MaintenanceModal/MaintenanceModal";

type MaintenanceGateProps = {
  children: ReactNode;
};

export const MaintenanceGate = ({ children }: MaintenanceGateProps) => {
  const { isLoading, isInMaintenance } = useMaintenance();

  // Block children until we know the maintenance status.
  // The splash screen remains visible during this brief check.
  if (isLoading) {
    return null;
  }

  // When in maintenance mode, only render the maintenance modal.
  // This completely blocks the app from mounting (including auth flows).
  if (isInMaintenance) {
    return <MaintenanceModal />;
  }

  return <>{children}</>;
};
