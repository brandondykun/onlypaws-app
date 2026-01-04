import { AxiosError } from "axios";

import { PaginatedResponse } from "@/types/shared/pagination";

import {
  ProfileDetails,
  ProfileImage,
  Profile,
  CreateProfileResponse,
  PostDetailed,
  SearchedProfile,
  FollowProfile,
} from "../types";

import { axiosFetch, axiosPost, axiosPatch, axiosPatchCustomError, axiosInstance } from "./config";

export const getProfileDetails = async (profileId: number | string) => {
  const url = `/v1/profile/${profileId}/`;
  return await axiosFetch<ProfileDetails>(url);
};

export const getProfileDetailsForQuery = async (profileId: number | string) => {
  const url = `/v1/profile/${profileId}/`;
  return await axiosInstance.get<ProfileDetails>(url);
};

export const getProfilePosts = async (profileId: string | number) => {
  const url = `/v1/profile/${profileId}/posts/`;
  return await axiosFetch<PaginatedResponse<PostDetailed>>(url);
};

export const getProfilePostsForQuery = async (profileId: string | number, pageParam: number | string) => {
  const url = `/v1/profile/${profileId}/posts/?page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<PostDetailed>>(url);
};

export const searchProfiles = async (username: string) => {
  const url = `/v1/profile/search/?username=${encodeURIComponent(username)}`;
  return await axiosFetch<PaginatedResponse<SearchedProfile>>(url);
};

export const searchProfilesForQuery = async (username: string, pageParam: number | string) => {
  const url = `/v1/profile/search/?username=${encodeURIComponent(username)}&page=${pageParam}`;
  return await axiosInstance.get<PaginatedResponse<SearchedProfile>>(url);
};

export const addProfileImage = async (postData: FormData, accessToken: string) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const url = "/v1/profile/image/";
  return await axiosPost<ProfileImage>(url, postData, config);
};

export const editProfileImage = async (imageId: number, postData: FormData, accessToken: string) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const url = `/v1/profile/image/${imageId}/`;
  return await axiosPatch<ProfileImage>(url, postData, config);
};

export const updateProfile = async (data: any, profileId: number) => {
  const url = `/v1/profile/${profileId}/`;
  return await axiosPatch<Profile>(url, data);
};

export const updateUsername = async (profileId: number, username: string) => {
  const url = `/v1/profile/${profileId}/`;
  return await axiosPatchCustomError<Profile>(url, { username });
};

// handle creating a new profile on add profile screen
export const createProfile = async (
  username: string,
  about: string,
  name: string,
  breed: string,
  pet_type?: number,
) => {
  const url = "/v1/profile/";
  try {
    const res = await axiosInstance.post<CreateProfileResponse>(url, { username, about, name, breed, pet_type });
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    const data = error.response?.data as { username?: string[] };
    return { data: null, error: data, status: error.status };
  }
};

export const searchFollowers = async (profileId: number, username: string) => {
  const url = `/v1/profile/${profileId}/followers/?username=${username}`;
  return await axiosFetch<PaginatedResponse<FollowProfile>>(url);
};

export const searchFollowing = async (profileId: number, username: string) => {
  const url = `/v1/profile/${profileId}/following/?username=${username}`;
  return await axiosFetch<PaginatedResponse<FollowProfile>>(url);
};

export const getPetTypeOptions = async () => {
  const url = `/v1/profile/pet-types/`;
  return await axiosFetch<{ id: number; name: string }[]>(url);
};

export const deleteProfile = async (profileId: number) => {
  const url = `/v1/profile/${profileId}/`;
  try {
    const res = await axiosInstance.delete(url);
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.response?.data, status: error.status };
  }
};
