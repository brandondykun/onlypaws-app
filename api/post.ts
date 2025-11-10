import {
  PaginatedExploreResponse,
  PaginatedSavedPostsResponse,
  PostDetailed,
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

export const deletePostImage = async (id: number | string) => {
  const url = `/v1/post/image/${id}/`;
  return await axiosDelete(url);
};
