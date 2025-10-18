import {
  FeedbackTicket,
  CreateFeedbackTicket,
  FeedbackTicketDetailed,
  PaginatedFeedbackTicketsResponse,
} from "@/types/feedback/feedback";

import { axiosFetch, axiosPost } from "./config";

export const getFeedbackTickets = async () => {
  const url = `/v1/feedback/`;
  return await axiosFetch<PaginatedFeedbackTicketsResponse>(url);
};

export const createFeedbackTicket = async (feedbackTicket: CreateFeedbackTicket) => {
  const url = `/v1/feedback/`;
  return await axiosPost<FeedbackTicket>(url, feedbackTicket);
};

export const getFeedbackTicket = async (ticketId: number | string) => {
  const url = `/v1/feedback/${ticketId}/`;
  return await axiosFetch<FeedbackTicketDetailed>(url);
};
