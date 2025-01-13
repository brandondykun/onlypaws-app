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
};

export type ProfileOption = {
  id: number;
  username: string;
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
