import { PaginatedResponse } from "@/types/shared/pagination";

import { PostDetailed, SavedPost, PostImageTag } from "../types";

import { axiosFetch, axiosPost, axiosDelete, axiosPatch, axiosInstance } from "./config";

export const getFeed = async () => {
  const url = `/v1/post/feed/`;
  return await axiosFetch<PaginatedResponse<PostDetailed>>(url);
};

export const getFeedForQuery = async (pageParam: number | string) => {
  const url = `/v1/post/feed/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<PostDetailed>>(url);
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

export const updatePost = async (postId: number, caption: string, containsAi: boolean) => {
  const url = `/v1/post/${postId}/`;
  return await axiosPatch<PostDetailed>(url, { caption: caption, contains_ai: containsAi });
};

export const deletePost = async (postId: number) => {
  const url = `/v1/post/${postId}/`;
  return await axiosDelete(url);
};

export const getSavedPosts = async () => {
  const url = "/v1/post/saved/";
  return await axiosFetch<PaginatedResponse<PostDetailed>>(url);
};

export const getSavedPostsForQuery = async (pageParam: number | string) => {
  const url = `/v1/post/saved/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<PostDetailed>>(url);
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

export const getPostForQuery = async (postId: number | string) => {
  const url = `/v1/post/${postId}/`;
  return await axiosInstance.get<PostDetailed>(url);
};

export const getExplorePosts = async () => {
  const url = `/v1/post/explore/`;
  return await axiosFetch<PaginatedResponse<PostDetailed>>(url);
};

export const getExplorePostsForQuery = async (pageParam: number | string) => {
  const url = `/v1/post/explore/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<PostDetailed>>(url);
};

export const getSimilarPosts = async (postId: number) => {
  const url = `/v1/post/${postId}/similar/`;
  return await axiosFetch<PaginatedResponse<PostDetailed>>(url);
};

export const getSimilarPostsForQuery = async (postId: number | string, pageParam: number | string) => {
  const url = `/v1/post/${postId}/similar/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<PostDetailed>>(url);
};

export const deletePostImage = async (id: number | string) => {
  const url = `/v1/post/image/${id}/`;
  return await axiosDelete(url);
};

export const createPostImageTag = async (tag: {
  post_image_id: number;
  tagged_profile_id: number;
  x_position: number; // 0-100 percentage
  y_position: number; // 0-100 percentage
  original_width: number;
  original_height: number;
}) => {
  const url = `/v1/post/image/tag/`;
  return await axiosPost<PostImageTag>(url, tag);
};

export const deletePostImageTag = async (id: number | string) => {
  const url = `/v1/post/image/tag/${id}/`;
  return await axiosDelete(url);
};

export const getTaggedPostsForQuery = async (profileId: number | string, pageParam: number | string) => {
  const url = `/v1/profile/${profileId}/tagged/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<PostDetailed>>(url);
};
