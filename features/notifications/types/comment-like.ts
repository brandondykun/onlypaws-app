import { Profile } from "@/types";

import { DBBaseNotification, WSBaseNotification } from "./base";

// Extra data for comment like notifications
// same for ws notification and db fetched notifications
export interface CommentLikeExtraData {
  comment_text: string; // Truncated to 100 chars
  comment_id: number;
  post_id: number;
  post_caption: string; // Truncated to 100 chars
  liker_username: string;
  liker_id: number;
  post_preview_image: string | null; // Full URL to post image
  post_public_id: string;
  liker_public_id: string;
}

// Comment like notification from relational database
export interface DBCommentLikeNotification extends DBBaseNotification {
  post: null; // Related post
  notification_type: "like_comment";
  comment: number;
  sender: Profile;
  extra_data: CommentLikeExtraData; // Additional data as JSON
}

// Comment like notification sent via websocket
export interface WSCommentLikeNotification extends WSBaseNotification {
  notification_type: "like_comment";
  extra_data: CommentLikeExtraData;
}
