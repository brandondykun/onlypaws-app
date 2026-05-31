import { axiosFetch, axiosPost, axiosInstance } from "@/api/config";
import type { FeedbackTicket, CreateFeedbackTicket, FeedbackTicketDetailed } from "@/features/feedback/types";
import type { PaginatedResponse } from "@/types/shared/pagination";

export const getFeedbackTickets = async () => {
  const url = `/v1/feedback/`;
  return await axiosFetch<PaginatedResponse<FeedbackTicket>>(url);
};

export const getFeedbackTicketsForQuery = async (pageParam: number | string) => {
  const url = `/v1/feedback/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<FeedbackTicket>>(url);
};

export const createFeedbackTicket = async (feedbackTicket: CreateFeedbackTicket) => {
  const url = `/v1/feedback/`;
  return await axiosPost<FeedbackTicket>(url, feedbackTicket);
};

export const getFeedbackTicket = async (ticketId: number | string) => {
  const url = `/v1/feedback/${ticketId}/`;
  return await axiosInstance.get<FeedbackTicketDetailed>(url);
};
