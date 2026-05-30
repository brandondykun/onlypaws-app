import { Profile } from "@/types";

import { DBBaseNotification, WSBaseNotification } from "./base";

// Follow request notification specific extra data
export interface FollowRequestNotificationExtraData {
  requester_username: string;
  requester_id: number;
  requester_avatar: string | null; // Full URL
  requester_about: string;
  follow_request_id: number;
  requester_name: string;
  // For regular profiles:
  requester_pet_type?: string | null;
  requester_breed?: string;
  // For business profiles:
  requester_business_category?: string | null;
  requester_public_id: string;
  target_public_id: string;
}

// Follow request notification from relational database
export interface DBFollowRequestNotification extends DBBaseNotification {
  post: null; // Related post
  notification_type: "follow_request";
  comment: null;
  sender: Profile;
  extra_data: FollowRequestNotificationExtraData; // Additional data as JSON
}

// Follow request notification sent via websocket
export interface WSFollowRequestNotification extends WSBaseNotification {
  notification_type: "follow_request";
  extra_data: FollowRequestNotificationExtraData;
}
