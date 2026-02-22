import { AxiosError } from "axios";

import { PaginatedResponse } from "@/types/shared/pagination";

import {
  ProfileDetails,
  ProfileImage,
  ProfileImageUploadUrlResponse,
  Profile,
  CreateProfileResponse,
  PostDetailed,
  SearchedProfile,
} from "../types";

import { axiosFetch, axiosPatch, axiosPatchCustomError, axiosInstance } from "./config";

export const getProfileDetails = async (profileId: number | string) => {
  const url = `/v1/profile/${profileId}/`;
  return await axiosFetch<ProfileDetails>(url);
};

export const getProfileDetailsForQuery = async (publicId: string) => {
  const url = `/v1/profile/${publicId}/`;
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

/** Step 1: Get presigned upload URL for profile image (create or update). Auth + AUTH-PROFILE-ID from interceptor. */
export const getProfileImageUploadUrl = async (
  profileId: number,
): Promise<{ data: ProfileImageUploadUrlResponse | null; error: string | null }> => {
  try {
    const res = await axiosInstance.post<ProfileImageUploadUrlResponse>("/v1/profile/image/upload-url/", {
      profileId,
    });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: (error.response?.data as { detail?: string })?.detail ?? error.message };
  }
};

/** Step 2: Upload raw file to presigned URL. No auth header; URL is already authorized. */
export const uploadFileToPresignedUrl = async (
  uploadUrl: string,
  fileUri: string,
  contentType: string,
): Promise<{ ok: boolean; error: string | null }> => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const putResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": contentType },
    });
    if (!putResponse.ok) {
      const text = await putResponse.text();
      return { ok: false, error: text || `Upload failed: ${putResponse.status}` };
    }
    return { ok: true, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
};

/** Step 3: Confirm upload so backend attaches the file to the profile. Returns 201 (new) or 200 (update). Auth + AUTH-PROFILE-ID from interceptor. */
export const confirmProfileImageUpload = async (
  profileId: number,
  key: string,
): Promise<{ data: ProfileImage | null; error: string | null; status?: number }> => {
  try {
    const res = await axiosInstance.post<ProfileImage>("/v1/profile/image/confirm-upload/", { profileId, key });
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    const data = error.response?.data as { detail?: string };
    return { data: null, error: data?.detail ?? error.message, status: error.response?.status };
  }
};

export const updateProfile = async (data: any, profileId: string) => {
  const url = `/v1/profile/${profileId}/`;
  return await axiosPatch<Profile>(url, data);
};

export const updateUsername = async (profileId: string, username: string) => {
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

export const getPetTypeOptions = async () => {
  const url = `/v1/profile/pet-types/`;
  return await axiosFetch<{ id: number; name: string }[]>(url);
};

export const deleteProfile = async (profileId: string) => {
  const url = `/v1/profile/${profileId}/`;
  try {
    const res = await axiosInstance.delete(url);
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.response?.data, status: error.status };
  }
};
