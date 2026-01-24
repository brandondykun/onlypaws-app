import { FollowRequest, SentFollowRequest, AcceptFollowRequestResponse } from "@/types/follow-requests/follow-requests";
import { CommentChainResponse } from "@/types/post/post";
import { PaginatedResponse } from "@/types/shared/pagination";

import { PostCommentDetailed, PostLike, CommentLike, Follow, FollowProfile } from "../types";

import { axiosFetch, axiosPost, axiosDelete, axiosInstance } from "./config";

export const addLike = async (postId: number, profileId: number) => {
  const url = `/v1/interactions/like/post/${postId}/`;
  return await axiosPost<PostLike>(url, { profileId });
};

export const removeLike = async (postId: number) => {
  const url = `/v1/interactions/like/post/${postId}/`;
  return await axiosDelete(url);
};

export const addComment = async (
  post: number,
  text: string,
  profileId: number,
  parent_comment: number | null,
  reply_to_comment: number | null,
) => {
  const url = `/v1/interactions/comment/post/${post}/`;
  return await axiosPost<PostCommentDetailed>(url, { text, profileId, parent_comment, reply_to_comment });
};

export const getPostComments = async (postId: number) => {
  const url = `/v1/interactions/comment/post/${postId}/list/`;
  return await axiosFetch<PaginatedResponse<PostCommentDetailed>>(url);
};

export const getCommentReplies = async (commentId: number) => {
  const url = `/v1/interactions/comment/${commentId}/replies/`;
  return await axiosFetch<PaginatedResponse<PostCommentDetailed>>(url);
};

export const getCommentChain = async (commentId: string | number) => {
  const url = `/v1/interactions/comment/${commentId}/chain/`;
  return await axiosFetch<CommentChainResponse>(url);
};

export const likeComment = async (commentId: number, profileId: number) => {
  const url = `/v1/interactions/like/comment/${commentId}/`;
  return await axiosPost<CommentLike>(url, { profileId });
};

export const deleteCommentLike = async (commentId: number) => {
  const url = `/v1/interactions/like/comment/${commentId}/`;
  return await axiosDelete(url);
};

export const followProfile = async (profileId: number) => {
  const url = "/v1/interactions/follow/";
  return await axiosPost<Follow>(url, { profileId });
};

export const unfollowProfile = async (profileId: number) => {
  const url = `/v1/interactions/follow/${profileId}/`;
  return await axiosDelete(url);
};

export const getFollowers = async (profileId: number) => {
  const url = `/v1/interactions/followers/${profileId}/`;
  return await axiosFetch<PaginatedResponse<FollowProfile>>(url);
};

export const getFollowersForQuery = async (profileId: number, pageParam: number | string, username?: string) => {
  const params = new URLSearchParams({ page: String(pageParam) });
  if (username) {
    params.append("username", username);
  }
  const url = `/v1/interactions/followers/${profileId}/?${params.toString()}`;
  return await axiosInstance.get<PaginatedResponse<FollowProfile>>(url);
};

export const getFollowing = async (profileId: number) => {
  const url = `/v1/interactions/following/${profileId}/`;
  return await axiosFetch<PaginatedResponse<FollowProfile>>(url);
};

export const getFollowRequests = async (pageParam: number | string) => {
  const url = `/v1/interactions/follow-requests/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<FollowRequest>>(url);
};

export const getSentFollowRequests = async (pageParam: number | string) => {
  const url = `/v1/interactions/follow-requests/sent/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<SentFollowRequest>>(url);
};

export const acceptFollowRequest = async (requestId: number) => {
  const url = `/v1/interactions/follow-request/${requestId}/accept/`;
  return await axiosInstance.post<AcceptFollowRequestResponse>(url, {});
};

export const declineFollowRequest = async (requestId: number) => {
  const url = `/v1/interactions/follow-request/${requestId}/decline/`;
  return await axiosDelete(url);
};

export const cancelFollowRequest = async (profileId: number) => {
  const url = `/v1/interactions/follow-request/${profileId}/cancel/`;
  return await axiosDelete(url);
};
