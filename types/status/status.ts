export type SystemStatus = "operational" | "maintenance";

export type SystemStatusResponse = {
  status: SystemStatus;
  message: string | null;
  estimated_end_time: string | null; // ISO 8601 datetime string
};
