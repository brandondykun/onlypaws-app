import { Profile } from "@/types";

import { DBBaseNotification, WSBaseNotification } from "./base";

// Comment notification specific extra data
export interface CommentNotificationExtraData {
  comment_text: string; // First 100 characters of the comment
  comment_id: number;
  post_id: number;
  post_caption: string; // First 100 characters of the post caption
  commenter_username: string;
  commenter_id: number;
  post_preview_image?: string | null; // Full URL to the post's first image
  is_reply: false; // Always false for post comments
}

// Comment notification from relational database
export interface DBCommentNotification extends DBBaseNotification {
  post: number; // Related post
  notification_type: "comment";
  comment: number;
  sender: Profile;
  extra_data: CommentNotificationExtraData; // Additional data as JSON
}

// Comment notification sent via websocket
export interface WSCommentNotification extends WSBaseNotification {
  notification_type: "comment";
  extra_data: CommentNotificationExtraData;
}
