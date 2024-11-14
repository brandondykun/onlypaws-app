import { AxiosError } from "axios";

import {
  PaginatedExploreResponse,
  PaginatedPostCommentsResponse,
  PaginatedProfilePostsResponse,
  PostDetailed,
  PostCommentDetailed,
} from "../types";

import { axiosFetch, axiosPost, axiosInstance } from "./config";

export const getProfilePosts = async (profileId: string | number) => {
  const url = `/v1/profile/${profileId}/posts/`;
  return await axiosFetch<PaginatedProfilePostsResponse>(url);
};

export const createPost = async (postData: FormData, accessToken: string) => {
  try {
    const res = await axiosInstance.post<PostDetailed>("/v1/post/", postData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const addLike = async (postId: number, profileId: number) => {
  try {
    const res = await axiosInstance.post(`/v1/post/${postId}/like/`, { profileId });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

// profile id is the profile requesting the delete
export const removeLike = async (postId: number, profileId: number) => {
  try {
    const res = await axiosInstance.delete(`/v1/post/${postId}/like/${profileId}`);
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
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
