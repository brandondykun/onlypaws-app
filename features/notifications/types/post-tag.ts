import { Profile } from "@/types";

import { DBBaseNotification, WSBaseNotification } from "./base";

// Extra data for post like notifications
// same for ws notification and db fetched notifications
export interface PostTagExtraData {
  post_caption: string;
  post_id: number;
  post_image_id: number;
  tagger_username: string;
  tagger_id: number;
  post_preview_image: string | null; // Full URL to post image
  post_public_id: string;
  post_image_public_id: string;
  post_image_url: string;
}

// Post like notification from relational database
export interface DBPostTagNotification extends DBBaseNotification {
  post: number; // Related post
  notification_type: "tagged_post";
  comment: null;
  sender: Profile;
  extra_data: PostTagExtraData; // Additional data as JSON
}

// Post like notification sent via websocket
export interface WSPostTagNotification extends WSBaseNotification {
  notification_type: "tagged_post";
  extra_data: PostTagExtraData;
}
