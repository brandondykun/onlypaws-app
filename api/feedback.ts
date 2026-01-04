import {
  FeedbackTicket,
  CreateFeedbackTicket,
  FeedbackTicketDetailed,
  PaginatedFeedbackTicketsResponse,
} from "@/types/feedback/feedback";

import { axiosFetch, axiosPost, axiosInstance } from "./config";

export const getFeedbackTickets = async () => {
  const url = `/v1/feedback/`;
  return await axiosFetch<PaginatedFeedbackTicketsResponse>(url);
};

export const getFeedbackTicketsForQuery = async (pageParam: number | string) => {
  const url = `/v1/feedback/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedFeedbackTicketsResponse>(url);
};

export const createFeedbackTicket = async (feedbackTicket: CreateFeedbackTicket) => {
  const url = `/v1/feedback/`;
  return await axiosPost<FeedbackTicket>(url, feedbackTicket);
};

export const getFeedbackTicket = async (ticketId: number | string) => {
  const url = `/v1/feedback/${ticketId}/`;
  return await axiosInstance.get<FeedbackTicketDetailed>(url);
};
