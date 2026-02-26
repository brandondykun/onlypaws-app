import { ReportReason, CreatePostReportResponse, PostReport } from "@/types";
import { PaginatedResponse } from "@/types/shared/pagination";

import { axiosFetch, axiosPost, axiosInstance } from "./config";

export const getReportReasons = async () => {
  const url = `/v1/moderation/report-reason/`;
  return await axiosFetch<ReportReason[]>(url);
};

export const reportPost = async (postId: number, reasonId: number, details: string) => {
  const url = `/v1/moderation/report/`;
  return await axiosPost<CreatePostReportResponse>(url, { post: postId, reason: reasonId, details: details });
};

export const getPostReportsForQuery = async (pageParam: number | string) => {
  const url = `/v1/moderation/report/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<PostReport>>(url);
};

export const getPostReport = async (id: string | number) => {
  const url = `/v1/moderation/report/${id}/`;
  return await axiosInstance.get<PostReport>(url);
};
