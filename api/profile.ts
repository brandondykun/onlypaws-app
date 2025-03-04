import { AxiosError } from "axios";

import {
  ProfileDetails,
  ProfileImage,
  Profile,
  PaginatedSearchedProfileResponse,
  PaginatedFeedResponse,
  Follow,
  CreateProfileResponse,
  PaginatedProfileResponse,
} from "../types";

import { axiosFetch, axiosPost, axiosDelete, axiosPatch, axiosPatchCustomError, axiosInstance } from "./config";

export const getProfileDetails = async (profileId: number | string, authProfileId: number | undefined) => {
  const url = `/v1/profile/${profileId}?profileId=${authProfileId}`;
  return await axiosFetch<ProfileDetails>(url);
};

export const getFeed = async (profileId: number) => {
  const url = `/v1/profile/${profileId}/feed/`;
  return await axiosFetch<PaginatedFeedResponse>(url);
};

export const searchProfiles = async (username: string, profileId: number) => {
  const url = `/v1/profile/${profileId}/search?username=${username}`;
  return await axiosFetch<PaginatedSearchedProfileResponse>(url);
};

export const followProfile = async (profileId: number, authProfileId: number) => {
  const url = `/v1/profile/${authProfileId}/follow/`;
  return await axiosPost<Follow>(url, { profileId });
};

export const unfollowProfile = async (profileId: number, authProfileId: number) => {
  const url = `/v1/profile/${authProfileId}/follow/${profileId}/`;
  return await axiosDelete(url);
};

export const addProfileImage = async (postData: FormData, accessToken: string) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const url = "/v1/auth/profile-image/";
  return await axiosPost<ProfileImage>(url, postData, config);
};

export const editProfileImage = async (imageId: number, postData: FormData, accessToken: string) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const url = `/v1/auth/profile-image/${imageId}/`;
  return await axiosPatch<ProfileImage>(url, postData, config);
};

export const updateProfile = async (data: any, profileId: number) => {
  const url = `/v1/auth/profile/${profileId}/`;
  return await axiosPatch<Profile>(url, data);
};

export const updateUsername = async (profileId: number, username: string) => {
  const url = `/v1/auth/profile/${profileId}/`;
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
  const url = "/v1/auth/profile/";
  try {
    const res = await axiosInstance.post<CreateProfileResponse>(url, { username, about, name, breed, pet_type });
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    const data = error.response?.data as { username?: string[] };
    return { data: null, error: data, status: error.status };
  }
};

export const getFollowers = async (profileId: number) => {
  const url = `/v1/profile/${profileId}/followers/`;
  return await axiosFetch<PaginatedProfileResponse>(url);
};

export const getFollowing = async (profileId: number) => {
  const url = `/v1/profile/${profileId}/following/`;
  return await axiosFetch<PaginatedProfileResponse>(url);
};

export const searchFollowers = async (profileId: number, username: string) => {
  const url = `/v1/profile/${profileId}/followers/?username=${username}`;
  return await axiosFetch<PaginatedProfileResponse>(url);
};

export const searchFollowing = async (profileId: number, username: string) => {
  const url = `/v1/profile/${profileId}/following/?username=${username}`;
  return await axiosFetch<PaginatedProfileResponse>(url);
};

export const getPetTypeOptions = async () => {
  const url = `/v1/auth/pet-type-options/`;
  return await axiosFetch<{ id: number; name: string }[]>(url);
};

export const deleteProfile = async (profileId: number) => {
  const url = `/v1/auth/profile/${profileId}/`;
  try {
    const res = await axiosInstance.delete(url);
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.response?.data, status: error.status };
  }
};
