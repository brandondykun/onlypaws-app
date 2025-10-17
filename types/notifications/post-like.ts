import { Profile } from "@/types";

import { DBBaseNotification, WSBaseNotification } from "./base";

// Extra data for post like notifications
// same for ws notification and db fetched notifications
export interface PostLikeExtraData {
  liker_id: number;
  liker_username: string;
  post_caption: string;
  post_id: number;
  post_preview_image: string | null; // Full URL to post image
}

// Post like notification from relational database
export interface DBPostLikeNotification extends DBBaseNotification {
  post: number; // Related post
  notification_type: "like_post";
  comment: null;
  sender: Profile;
  extra_data: PostLikeExtraData; // Additional data as JSON
}

// Post like notification sent via websocket
export interface WSPostLikeNotification extends WSBaseNotification {
  notification_type: "like_post";
  extra_data: PostLikeExtraData;
}
