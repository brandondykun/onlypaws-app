import { UserBasic } from "@/types";

export type FeedbackTicketType = "general" | "bug" | "feature";
export type FeedbackPriorityType = "low" | "medium" | "high" | "critical";
export type FeedbackStatusType = "open" | "in_progress" | "resolved" | "closed" | "duplicate";

export type DeviceInfo = {
  device_model?: string;
  manufacturer?: string;
  os_name?: string;
  os_version?: string;
};

export type CreateFeedbackTicket = {
  title: string;
  description: string;
  ticket_type: FeedbackTicketType;
  app_version?: string;
  device_info?: DeviceInfo;
};

export type FeedbackTicket = {
  id: number;
  title: string;
  ticket_type: FeedbackTicketType;
  status: FeedbackStatusType;
  priority: FeedbackPriorityType;
  reporter: UserBasic;
  assignee: UserBasic | null;
  created_at: string;
  updated_at: string;
  comments_count: string;
  description: string;
};

export type FeedbackTicketDetailed = {
  id: number;
  title: string;
  description: string;
  ticket_type: FeedbackTicketType;
  status: FeedbackStatusType;
  priority: FeedbackPriorityType;
  reporter: UserBasic;
  assignee: UserBasic | null;
  created_at: string;
  updated_at: string;
  app_version: string;
  device_info: DeviceInfo;
  comments: FeedbackTicketComment[];
  comments_count: string;
};

export type FeedbackTicketComment = {
  id: number;
  ticket: number;
  content: string;
  author: UserBasic;
  is_internal: boolean;
  created_at: string;
};
