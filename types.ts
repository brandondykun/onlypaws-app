import { ImageAspectRatio } from "./types/post/post";

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
  regular_profile_onboarding_completed: boolean;
  business_profile_onboarding_completed: boolean;
};

export type UserBasic = {
  id: null | number;
  email: null | string;
};

export type ProfileType = "regular" | "business";

export type ProfileOption = {
  id: number;
  username: string;
  image: ProfileImage | null;
  name: string;
  profile_type: ProfileType;
};

export type ProfileImageProcessingStatus = "UPLOADED" | "PROCESSING" | "READY" | "FAILED" | "PENDING_UPLOAD";

export type ProfileImageScaledVariant = {
  id: number;
  scale: "small" | "medium";
  image: string;
  width?: number;
  height?: number;
};

export type ProfileImage = {
  id: number;
  image: string;
  profile: number;
  created_at: string;
  updated_at: string;
  processing_status?: ProfileImageProcessingStatus;
  scaled_images?: ProfileImageScaledVariant[];
};

export type ProfileImageUploadUrlResponse = {
  upload_url: string;
  key: string;
  expires_in: number;
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
  is_private: boolean;
  profile_type: ProfileType;
};

export type SearchedProfile = {
  id: number;
  username: string;
  about: string;
  is_following: boolean;
  image: ProfileImage | null;
  name: string;
  profile_type: ProfileType;
  has_requested_follow: boolean;
  is_private: boolean;
  follows_you: boolean;
};

export type MyInfo = {
  email: string;
  id: number;
  profiles: ProfileOption[];
  is_email_verified: boolean;
  regular_profile_onboarding_completed: boolean;
  business_profile_onboarding_completed: boolean;
};

export type UserProfile = {
  id: number;
  email: string;
  profile: Profile;
};

export type PostImageTag = {
  id: number;
  tagged_profile: SearchedProfile;
  tagged_by_profile: SearchedProfile;
  x_position: string;
  y_position: string;
  created_at: string;
};

// Post status for processing state
export type PostStatus = "PENDING_UPLOAD" | "PROCESSING" | "READY" | "FAILED";

// Scale options for scaled images
export type ImageScale = "small" | "medium";

// Scaled image variant
export type PostImageScaled = {
  id: number;
  scale: ImageScale;
  image: string;
  width: number;
  height: number;
};

export type PostImage = {
  id: number;
  post: number;
  image: string | null; // May be null during processing
  order: number;
  tags: PostImageTag[];
  scaled_images: PostImageScaled[];
  localImageUri?: string; // Temporary local URI for optimistic display before processing completes
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
  aspect_ratio: ImageAspectRatio;
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
  tagged_profiles: SearchedProfile[];
  aspect_ratio: ImageAspectRatio;
  status: PostStatus;
};

// Define the shape of a page in your infinite query
export type PostsDetailedPage = {
  results: PostDetailed[] | null;
  next: string | null;
  previous: string | null;
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
  profile_type: ProfileType;
  is_private: boolean;
  can_view_posts: boolean;
  has_requested_follow: boolean;
  follows_you: boolean;
};

export type FollowProfile = {
  id: number;
  username: string;
  about: string;
  image: null | ProfileImage;
  name: string;
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
