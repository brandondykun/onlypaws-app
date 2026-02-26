import { ProfileReportReason, CreateProfileReportResponse, ProfileReport } from "@/types";
import { PaginatedResponse } from "@/types/shared/pagination";

import { axiosFetch, axiosPost, axiosInstance } from "./config";

export const getProfileReportReasons = async () => {
  const url = `/v1/moderation/profile-report-reason/`;
  return await axiosFetch<ProfileReportReason[]>(url);
};

export const reportProfile = async (profileId: number, reasonId: number, details: string) => {
  const url = `/v1/moderation/profile-report/`;
  return await axiosPost<CreateProfileReportResponse>(url, { profile: profileId, reason: reasonId, details: details });
};

export const getProfileReportsForQuery = async (pageParam: number | string) => {
  const url = `/v1/moderation/profile-report/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<ProfileReport>>(url);
};

export const getProfileReport = async (reportId: number | string) => {
  const url = `/v1/moderation/profile-report/${reportId}/`;
  return await axiosFetch<ProfileReport>(url);
};
