import { Profile } from "@/types";

import { DBBaseNotification, WSBaseNotification } from "./base";

// Extra data specific to follow notifications
export interface FollowExtraData {
  follower_username: string;
  follower_id: number;
  follower_avatar: string | null; // Full URL to avatar image
  follower_about: string; // Snippet (max 150 chars + "...")
  follower_name: string;
  follower_pet_type: string | null; // Pet type name, not the full object
  follower_breed: string;
  follower_public_id: string;
}

// 1. Database Fetch (REST API) - uses NotificationSerializer
export interface DBFollowNotification extends DBBaseNotification {
  post: null; // Will be null for follow notifications
  notification_type: "follow"; // Specific to follow notifications
  comment: null; // Will be null for follow notifications
  sender: Profile;
  extra_data: FollowExtraData;
}

// 2. WebSocket Notification - uses WebSocketNotificationSerializer
export interface WSFollowNotification extends WSBaseNotification {
  notification_type: "follow"; // Specific to follow notifications
  extra_data: FollowExtraData;
}
