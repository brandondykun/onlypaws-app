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
  // default: boolean;
};

export type ProfileImage = {
  id: number;
  image: string;
  profile: number;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: null | number;
  username: null | string;
  about: null | string;
  // user: null | number;
  image: null | ProfileImage;
  name: string;
};

export type SearchedProfile = {
  id: number;
  username: string;
  about: string;
  // user: number;
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
  likes: PostLike[];
  comments: PostCommentDetailed[];
  comments_count: number;
};

export type ProfileDetails = {
  id: number;
  username: string;
  name: string;
  about: string | null;
  followers: Profile[];
  following: Profile[];
  // posts: Post[];
  image: ProfileImage | null;
  is_following: boolean;
  posts_count: number;
  followers_count: number;
  following_count: number;
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
