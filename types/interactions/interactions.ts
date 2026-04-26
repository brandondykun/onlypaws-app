export type PostInteractionType = "preview_click" | "view" | "like" | "save" | "comment";

export interface PostInteractionResponse {
  id: number;
  public_id: string;
  post: number;
  profile: number;
  interaction_type: PostInteractionType;
  dwell_time_ms: number | null;
  created_at: string;
}
