import { AxiosError } from "axios";

import {
  ProfileDetails,
  ProfileImage,
  Profile,
  PaginatedSearchedProfileResponse,
  PaginatedFeedResponse,
  Follow,
  CreateProfileResponse,
} from "../types";

import { axiosInstance } from "./config";

export const getProfileDetails = async (profileId: number | string, authProfileId: number | undefined) => {
  try {
    const res = await axiosInstance.get<ProfileDetails>(`/v1/profile/${profileId}?profileId=${authProfileId}`);
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const getFeed = async (profileId: number) => {
  try {
    const res = await axiosInstance.get<PaginatedFeedResponse>(`/v1/profile/${profileId}/feed/`);
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const searchProfiles = async (username: string, profileId: number) => {
  try {
    const res = await axiosInstance.get<PaginatedSearchedProfileResponse>(
      `/v1/profile/${profileId}/search?username=${username}`,
    );
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const followProfile = async (profileId: number, authProfileId: number) => {
  try {
    const res = await axiosInstance.post<Follow>(`/v1/profile/${authProfileId}/follow/`, { profileId });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const unfollowProfile = async (profileId: number, authProfileId: number) => {
  try {
    const res = await axiosInstance.delete(`/v1/profile/${authProfileId}/follow/${profileId}/`);
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const addProfileImage = async (postData: FormData, accessToken: string) => {
  try {
    const res = await axiosInstance.post<ProfileImage>("/v1/auth/profile-image/", postData, {
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

export const editProfileImage = async (imageId: number, postData: FormData, accessToken: string) => {
  try {
    const res = await axiosInstance.patch<ProfileImage>(`/v1/auth/profile-image/${imageId}/`, postData, {
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

export const updateAboutText = async (text: string, profileId: number) => {
  try {
    const res = await axiosInstance.patch<Profile>(`/v1/auth/profile/${profileId}/`, { about: text });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const updateName = async (text: string, profileId: number) => {
  try {
    const res = await axiosInstance.patch<Profile>(`/v1/auth/profile/${profileId}/`, { name: text });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const createProfile = async (username: string, about: string, name: string) => {
  try {
    const res = await axiosInstance.post<CreateProfileResponse>("/v1/auth/profile/", { username, about, name });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};
