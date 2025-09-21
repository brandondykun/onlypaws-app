export type Tokens = {
  access: string;
  refresh: string;
};

export type AccessToken = {
  access: string;
};

export type User = {
  id: null | number;
  email: null | string;
  profiles: ProfileOption[] | null;
  is_email_verified: boolean;
};

export type UserBasic = {
  id: null | number;
  email: null | string;
};

export type ProfileOption = {
  id: number;
  username: string;
  image: ProfileImage | null;
  name: string;
};

export type ProfileImage = {
  id: number;
  image: string;
  profile: number;
  created_at: string;
  updated_at: string;
};

export type PetType = {
  id: number;
  name: string;
};

export type PetTypeWithTitle = {
  title: string;
} & PetType;

export type Profile = {
  id: null | number;
  username: null | string;
  about: null | string;
  image: null | ProfileImage;
  name: string;
  pet_type: PetType | null;
  breed: string | null;
};

export type SearchedProfile = {
  id: number;
  username: string;
  about: string;
  is_following: boolean;
  image: ProfileImage | null;
  name: string;
};

export type MyInfo = {
  email: string;
  id: number;
  profiles: ProfileOption[];
  is_email_verified: boolean;
};

export type UserProfile = {
  id: number;
  email: string;
  profile: Profile;
};

export type PostImage = {
  id: number;
  post: number;
  image: string;
};

export type PostLike = {
  id: number;
  post: number;
  profile: number;
  liked_at: string;
};

export type CommentLike = {
  id: number;
  comment: number;
  profile: number;
  liked_at: string;
};

export type PostComment = {
  id: number;
  text: string;
  post: number;
  profile: number;
  created_at: string;
};

export type PostCommentDetailed = {
  id: number;
  text: string;
  post: number;
  profile: Profile;
  created_at: string;
  likes_count: number;
  liked: boolean;
  replies_count: number;
  replies: PostCommentDetailed[];
  parent_comment_username: string | null;
  reply_to_comment_username: string | null;
};

export type Post = {
  id: number;
  caption: string;
  profile: number;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  likes: PostLike[];
  comments: PostComment[];
  contains_ai: boolean;
};

export type PostDetailed = {
  id: number;
  caption: string;
  profile: Profile;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  comments_count: number;
  likes_count: number;
  liked: boolean;
  is_saved: boolean;
  reports: PostReportPreview[];
  is_hidden: boolean;
  is_reported: boolean; // has current profile already reported the post
  contains_ai: boolean;
};

export type ProfileDetails = {
  id: number;
  username: string;
  name: string;
  about: string | null;
  image: ProfileImage | null;
  is_following: boolean;
  posts_count: number;
  followers_count: number;
  following_count: number;
  pet_type: PetType | null;
  breed: string | null;
};

export type PaginatedExploreResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostDetailed[];
};

export type PaginatedPostCommentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostCommentDetailed[];
};

export type PaginatedProfilePostsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostDetailed[];
};

export type PaginatedSearchedProfileResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchedProfile[];
};

export type PaginatedFeedResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostDetailed[];
};

export type PaginatedSavedPostsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostDetailed[];
};

export type FollowProfile = {
  id: number;
  username: string;
  about: string;
  image: null | ProfileImage;
  name: string;
};

export type PaginatedProfileResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: FollowProfile[];
};

export type Follow = {
  created_at: string;
  followed: number;
  followed_by: number;
  id: number;
};

export type CreateProfileResponse = {
  about: string;
  id: number;
  user: number;
  username: string;
  name: string;
};

export type SavedPost = {
  id: number;
  profile: number;
  post: number;
};

export type PostReportStatus = "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

export type ReportReason = {
  id: number;
  name: string;
  description: string;
};

export type PaginatedReportReasonsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReportReason[];
};

export type CreatePostReportResponse = {
  id: number;
  post: number;
  reason: number;
  details: string;
};

export type PostReportPreview = {
  id: number;
  reason: ReportReason;
  status: PostReportStatus;
};

export type FeedbackTicketType = "general" | "bug" | "feature";
export type FeedbackPriorityType = "low" | "medium" | "high" | "critical";
export type FeedbackStatusType = "open" | "in_progress" | "resolved" | "closed" | "duplicate";

export type CreateFeedbackTicket = {
  title: string;
  description: string;
  ticket_type: FeedbackTicketType;
};

export type FeedbackTicket = {
  id: number;
  title: string;
  ticket_type: FeedbackTicketType;
  status: FeedbackStatusType;
  priority: FeedbackPriorityType;
  reporter: UserBasic;
  assignee: UserBasic | null;
  created_at: string;
  updated_at: string;
  comments_count: string;
  description: string;
};

export type FeedbackTicketDetailed = {
  id: number;
  title: string;
  description: string;
  ticket_type: FeedbackTicketType;
  status: FeedbackStatusType;
  priority: FeedbackPriorityType;
  reporter: UserBasic;
  assignee: UserBasic | null;
  created_at: string;
  updated_at: string;
  app_version: string;
  device_info: string;
  comments: FeedbackTicketComment[];
  comments_count: string;
};

export type PaginatedFeedbackTicketsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: FeedbackTicket[];
};

export type FeedbackTicketComment = {
  id: number;
  ticket: number;
  content: string;
  author: UserBasic;
  is_internal: boolean;
  created_at: string;
};

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

// Extra data for post like notifications
// same for ws notification and db fetched notifications
export interface PostLikeExtraData {
  liker_id: number;
  liker_username: string;
  post_caption: string;
  post_id: number;
  post_preview_image: string | null;
}

// Post Like types
export interface DBPostLikeNotification extends DBBaseNotification {
  post: number; // Related post
  notification_type: "like_post";
  comment: null;
  sender: Profile;
  extra_data: PostLikeExtraData; // Additional data as JSON
}

// Post like notification will have specific type and extra data
export interface WSPostLikeNotification extends WSBaseNotification {
  notification_type: "like_post";
  extra_data: PostLikeExtraData;
}

// full websocket message type
export interface WSPostLikeMessage {
  notification: WSPostLikeNotification;
  type: "notification";
}

// Paginated notifications response fetched from relational database
export interface PaginatedNotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DBNotification[];
}

export interface WSCommentLikeNotification extends WSBaseNotification {
  notification_type: "like_comment";
  extra_data: {
    liker_id: number;
    liker_username: string;
    comment_text: string;
  };
}

// Notification from relational database
// the notifications can be of different types, but they will all have the same base fields
export type DBNotification = DBPostLikeNotification;

// Notification from websocket
export type WSNotification = WSPostLikeNotification;
