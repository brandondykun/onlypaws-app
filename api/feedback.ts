import { FeedbackTicket, CreateFeedbackTicket, FeedbackTicketDetailed } from "@/types/feedback/feedback";
import { PaginatedResponse } from "@/types/shared/pagination";

import { axiosFetch, axiosPost, axiosInstance } from "./config";

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
