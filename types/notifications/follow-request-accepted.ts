import { Profile } from "@/types";

import { DBBaseNotification, WSBaseNotification } from "./base";

// Follow request accepted notification specific extra data
export interface FollowRequestAcceptedNotificationExtraData {
  followed_username: string;
  followed_id: number;
  followed_avatar: string | null; // Full URL
  followed_about: string;
  followed_name: string;
  // For regular profiles:
  followed_pet_type?: string | null;
  followed_breed?: string;
  // For business profiles:
  followed_business_category?: string | null;
  followed_public_id: string;
  follower_public_id: string; // the profile that accepted the follow request
}

// Follow request accepted notification from relational database
export interface DBFollowRequestAcceptedNotification extends DBBaseNotification {
  post: null; // Related post
  notification_type: "follow_request_accepted";
  comment: null;
  sender: Profile;
  extra_data: FollowRequestAcceptedNotificationExtraData; // Additional data as JSON
}

// Follow request accepted notification sent via websocket
export interface WSFollowRequestAcceptedNotification extends WSBaseNotification {
  notification_type: "follow_request_accepted";
  extra_data: FollowRequestAcceptedNotificationExtraData;
}
