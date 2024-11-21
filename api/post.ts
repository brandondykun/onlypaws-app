import {
  PaginatedExploreResponse,
  PaginatedPostCommentsResponse,
  PaginatedProfilePostsResponse,
  PostDetailed,
  PostCommentDetailed,
  PostLike,
  CommentLike,
} from "../types";

import { axiosFetch, axiosPost, axiosDelete } from "./config";

export const getProfilePosts = async (profileId: string | number) => {
  const url = `/v1/profile/${profileId}/posts/`;
  return await axiosFetch<PaginatedProfilePostsResponse>(url);
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

export const addLike = async (postId: number, profileId: number) => {
  const url = `/v1/post/${postId}/like/`;
  return await axiosPost<PostLike>(url, { profileId });
};

// profile id is the profile requesting the delete
export const removeLike = async (postId: number, profileId: number) => {
  const url = `/v1/post/${postId}/like/${profileId}`;
  return await axiosDelete(url);
};

export const addComment = async (post: number, text: string, profileId: number) => {
  const url = `/v1/post/${post}/comment/`;
  return await axiosPost<PostCommentDetailed>(url, { text, profileId });
};

export const getPostComments = async (postId: number) => {
  const url = `/v1/post/${postId}/comments/`;
  return await axiosFetch<PaginatedPostCommentsResponse>(url);
};

export const getPost = async (postId: number | string) => {
  const url = `/v1/post/${postId}`;
  return await axiosFetch<PostDetailed>(url);
};

export const getExplorePosts = async (profileId: number) => {
  const url = `/v1/profile/${profileId}/explore/`;
  return await axiosFetch<PaginatedExploreResponse>(url);
};

export const getSimilarPosts = async (postId: number, profileId: number) => {
  const url = `/v1/post/${postId}/similar?profileId=${profileId}`;
  return await axiosFetch<PaginatedExploreResponse>(url);
};

export const likeComment = async (commentId: number, profileId: number) => {
  const url = `/v1/comment/${commentId}/like/`;
  return await axiosPost<CommentLike>(url, { profileId });
};

// authProfileId is the profile requesting the delete
export const deleteCommentLike = async (commentId: number, authProfileId: number) => {
  const url = `/v1/comment/${commentId}/like/${authProfileId}/`;
  return await axiosDelete(url);
};
