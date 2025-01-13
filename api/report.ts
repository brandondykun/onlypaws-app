import { PaginatedReportReasonsResponse, CreatePostReportResponse } from "@/types";

import { axiosFetch, axiosPost } from "./config";

export const getReportReasons = async () => {
  const url = `/v1/report-reason/`;
  return await axiosFetch<PaginatedReportReasonsResponse>(url);
};

export const reportPost = async (postId: number, reasonId: number, details: string) => {
  const url = `/v1/report/`;
  return await axiosPost<CreatePostReportResponse>(url, { post: postId, reason: reasonId, details: details });
};
