import { Profile } from "@/types";

import { PaginatedResponse } from "../shared/pagination";

import { DBCommentNotification, WSCommentNotification } from "./comment";
import { DBCommentLikeNotification, WSCommentLikeNotification } from "./comment-like";
import { DBCommentReplyNotification, WSCommentReplyNotification } from "./comment-reply";
import { DBFollowNotification, WSFollowNotification } from "./follow";
import { DBFollowRequestNotification, WSFollowRequestNotification } from "./follow-request";
import { DBFollowRequestAcceptedNotification, WSFollowRequestAcceptedNotification } from "./follow-request-accepted";
import { DBPostLikeNotification, WSPostLikeNotification } from "./post-like";
import { DBPostTagNotification, WSPostTagNotification } from "./post-tag";

// Types - matching Django model
export type NotificationType =
  | "like_post"
  | "tagged_post"
  | "like_comment"
  | "comment"
  | "comment_reply"
  | "follow"
  | "mention"
  | "system"
  | "follow_request"
  | "follow_request_accepted";

// base type for notifications fetched from relational database
export interface DBBaseNotification {
  id: number;
  created_at: string;
  is_read: boolean;
  message: string;
  title: string;
  recipient: Profile;
}

// base websocket notification type
// all ws notifications will have these fields
export interface WSBaseNotification {
  id: number;
  created_at: string;
  message: string;
  post_id: number;
  comment_id: number;
  sender_avatar: string | null;
  sender_username: string;
  title: string;
  is_read: boolean;
}

// Paginated notifications response
export type PaginatedDBNotificationsResponse = PaginatedResponse<DBNotification> & {
  extra_data: {
    unread_count: number;
  };
};

// Notification from relational database
// the notifications can be of different types, but they will all have the same base fields
export type DBNotification =
  | DBPostLikeNotification
  | DBPostTagNotification
  | DBCommentLikeNotification
  | DBFollowNotification
  | DBCommentReplyNotification
  | DBCommentNotification
  | DBFollowRequestNotification
  | DBFollowRequestAcceptedNotification;

// Notification from websocket
export type WSNotification =
  | WSPostLikeNotification
  | WSPostTagNotification
  | WSCommentLikeNotification
  | WSFollowNotification
  | WSCommentReplyNotification
  | WSCommentNotification
  | WSFollowRequestNotification
  | WSFollowRequestAcceptedNotification;

// full websocket message type
export interface WSNotificationMessage {
  notification: WSNotification;
  type: "notification";
}
