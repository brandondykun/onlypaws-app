import { Profile } from "@/types";

import { PaginatedResponse } from "../shared/pagination";

// ============================================================================
// Follow Request Types
// ============================================================================

/** Client-side status for follow requests */
export type FollowRequestStatus = "pending" | "accepted" | "declined";

/** GET /api/interactions/follow-requests/ - Received follow requests */
export type FollowRequest = {
  id: number;
  requester: Profile; // Full profile object of who sent the request
  target: number; // ID of the profile who received (current user)
  created_at: string;
};

/** Client-side enriched type with status tracking */
export type FollowRequestWithStatus = FollowRequest & {
  status: FollowRequestStatus;
};

/** Client-side status for sent follow requests */
export type SentFollowRequestStatus = "pending" | "cancelled" | "accepted";

/** GET /api/interactions/follow-requests/sent/ - Sent follow requests */
export type SentFollowRequest = {
  id: number;
  requester: number; // ID of who sent the request (current user)
  target: Profile; // Full profile object of who received the request
  created_at: string;
};

/** Client-side enriched type with status tracking */
export type SentFollowRequestWithStatus = SentFollowRequest & {
  status: SentFollowRequestStatus;
};

/** POST /api/interactions/follow-request/{id}/accept/ */
export type AcceptFollowRequestResponse = {
  id: number;
  followed: number;
  followed_by: number;
  created_at: string;
};

/** GET /api/interactions/follow-requests/ */
export type ListFollowRequestsResponse = PaginatedResponse<FollowRequest>;

/** GET /api/interactions/follow-requests/sent/ */
export type ListSentFollowRequestsResponse = PaginatedResponse<SentFollowRequest>;
