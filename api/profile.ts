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

import { axiosFetch, axiosPost, axiosDelete, axiosPatch } from "./config";

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

export const updateAboutText = async (text: string, profileId: number) => {
  const url = `/v1/auth/profile/${profileId}/`;
  return await axiosPatch<Profile>(url, { about: text });
};

export const updateName = async (text: string, profileId: number) => {
  const url = `/v1/auth/profile/${profileId}/`;
  return await axiosPatch<Profile>(url, { name: text });
};

export const createProfile = async (username: string, about: string, name: string) => {
  const url = "/v1/auth/profile/";
  return await axiosPost<CreateProfileResponse>(url, { username, about, name });
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
