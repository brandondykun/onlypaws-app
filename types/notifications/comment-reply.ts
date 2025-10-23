import { Profile } from "@/types";

import { DBBaseNotification, WSBaseNotification } from "./base";

// Comment notification specific extra data
export interface CommentReplyNotificationExtraData {
  comment_text: string; // First 100 characters of the comment
  comment_id: number;
  replied_to_comment_id: number;
  replied_to_comment_text: string; // First 100 characters of the replied to comment
  post_id: number;
  post_caption: string; // First 100 characters of the post caption
  commenter_username: string;
  commenter_id: number;
  post_preview_image?: string | null; // Full URL to the post's first image
  is_reply: true; // Always true for comment replies
}

// Comment notification from relational database
export interface DBCommentReplyNotification extends DBBaseNotification {
  post: number; // Related post
  notification_type: "comment_reply";
  comment: number;
  sender: Profile;
  extra_data: CommentReplyNotificationExtraData; // Additional data as JSON
}

// Comment notification sent via websocket
export interface WSCommentReplyNotification extends WSBaseNotification {
  notification_type: "comment_reply";
  extra_data: CommentReplyNotificationExtraData;
}
