import { Profile } from "@/types";

import { DBCommentLikeNotification, WSCommentLikeNotification } from "./comment-like";
import { DBFollowNotification, WSFollowNotification } from "./follow";
import { DBPostLikeNotification, WSPostLikeNotification } from "./post-like";

// Types - matching Django model
export type NotificationType = "like_post" | "like_comment" | "comment" | "follow" | "mention" | "system";

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
export interface PaginatedDBNotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DBNotification[];
}

// Notification from relational database
// the notifications can be of different types, but they will all have the same base fields
export type DBNotification = DBPostLikeNotification | DBCommentLikeNotification | DBFollowNotification;

// Notification from websocket
export type WSNotification = WSPostLikeNotification | WSCommentLikeNotification | WSFollowNotification;

// full websocket message type
export interface WSNotificationMessage {
  notification: WSNotification;
  type: "notification";
}
