import { PostDetailed, Profile } from "@/types";

export interface ChainComment {
  id: number;
  text: string;
  profile: Profile;
  post: number;
  created_at: string; // ISO 8601 datetime string
  parent_comment: number | null;
  reply_to_comment: number | null;
  reply_to_comment_username: string | null;
  likes_count: number;
  liked: boolean;
}

// Main response type for the comment chain endpoint
export interface CommentChainResponse {
  target_comment: ChainComment;
  root_parent_comment: ChainComment | null;
  parent_chain: ChainComment[]; // Up to 10 items
  omitted_count: number;
  post: PostDetailed;
}
