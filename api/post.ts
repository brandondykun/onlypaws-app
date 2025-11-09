import { CommentChainResponse } from "@/types/post/post";

import {
  PaginatedExploreResponse,
  PaginatedPostCommentsResponse,
  PaginatedSavedPostsResponse,
  PostDetailed,
  PostCommentDetailed,
  PostLike,
  CommentLike,
  SavedPost,
  PaginatedFeedResponse,
} from "../types";

import { axiosFetch, axiosPost, axiosDelete, axiosPatch } from "./config";

export const getFeed = async () => {
  const url = `/v1/post/feed/`;
  return await axiosFetch<PaginatedFeedResponse>(url);
};

export const createPost = async (postData: FormData, accessToken: string) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const url = "/v1/post/";
  return await axiosPost<PostDetailed>(url, postData, config);
};

export const updatePost = async (postId: number, caption: string) => {
  const url = `/v1/post/${postId}/`;
  return await axiosPatch<PostDetailed>(url, { caption: caption });
};

export const deletePost = async (postId: number) => {
  const url = `/v1/post/${postId}/`;
  return await axiosDelete(url);
};

export const getSavedPosts = async () => {
  const url = "/v1/post/saved/";
  return await axiosFetch<PaginatedSavedPostsResponse>(url);
};

export const savePost = async (postId: number, profileId: number) => {
  const url = `/v1/post/saved/`;
  return await axiosPost<SavedPost>(url, { profile: profileId, post: postId });
};

export const unSavePost = async (postId: number) => {
  const url = `/v1/post/saved/${postId}/`;
  return await axiosDelete(url);
};

export const addLike = async (postId: number, profileId: number) => {
  const url = `/v1/post/${postId}/like/`;
  return await axiosPost<PostLike>(url, { profileId });
};

export const removeLike = async (postId: number) => {
  const url = `/v1/post/${postId}/like/`;
  return await axiosDelete(url);
};

export const addComment = async (
  post: number,
  text: string,
  profileId: number,
  parent_comment: number | null,
  reply_to_comment: number | null,
) => {
  const url = `/v1/post/${post}/comment/`;
  return await axiosPost<PostCommentDetailed>(url, { text, profileId, parent_comment, reply_to_comment });
};

export const getPostComments = async (postId: number) => {
  const url = `/v1/post/${postId}/comments/`;
  return await axiosFetch<PaginatedPostCommentsResponse>(url);
};

export const getCommentReplies = async (postId: number, commentId: number) => {
  const url = `/v1/post/${postId}/comments/${commentId}/reply/`;
  return await axiosFetch<PaginatedPostCommentsResponse>(url);
};

export const getPost = async (postId: number | string) => {
  const url = `/v1/post/${postId}/`;
  return await axiosFetch<PostDetailed>(url);
};

export const getExplorePosts = async () => {
  const url = `/v1/post/explore/`;
  return await axiosFetch<PaginatedExploreResponse>(url);
};

export const getSimilarPosts = async (postId: number) => {
  const url = `/v1/post/${postId}/similar/`;
  return await axiosFetch<PaginatedExploreResponse>(url);
};

export const likeComment = async (commentId: number, profileId: number) => {
  const url = `/v1/comment/${commentId}/like/`;
  return await axiosPost<CommentLike>(url, { profileId });
};

// authProfileId is the profile requesting the delete
export const deleteCommentLike = async (commentId: number) => {
  const url = `/v1/comment/${commentId}/like/`;
  return await axiosDelete(url);
};

export const deletePostImage = async (id: number | string) => {
  const url = `/v1/post/image/${id}/`;
  return await axiosDelete(url);
};

export const getCommentChain = async (commentId: string | number) => {
  const url = `/v1/comment/${commentId}/chain/`;
  return await axiosFetch<CommentChainResponse>(url);
};
