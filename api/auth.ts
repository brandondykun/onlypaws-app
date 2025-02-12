import axios, { AxiosError } from "axios";

import { Tokens, AccessToken, UserProfile, MyInfo } from "../types";

import { axiosPost, axiosFetch, axiosPostCustomError, axiosInstance } from "./config";
import { BASE_URL } from "./config";

export const login = async (email: string, password: string) => {
  const url = `${BASE_URL}/v1/auth/login/`;
  return await axiosPost<Tokens>(url, { email, password });
};

export const refreshToken = async (refresh: string) => {
  try {
    // don't use wrapper function. This needs to use axios and not axiosInstance
    const res = await axios.post<AccessToken>(`${BASE_URL}/v1/auth/refresh/`, {
      refresh,
    });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const getMyInfo = async () => {
  const url = "/v1/auth/my-info/";
  return await axiosFetch<MyInfo>(url);
};

// register api call that can handle returning specific field errors
export const registerUser = async (email: string, password: string, username: string) => {
  const url = "/v1/auth/create-user/";
  try {
    const res = await axiosInstance.post<UserProfile>(url, { email, password, username });
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    const data = error.response?.data as any;
    return {
      data: null,
      error: data as { email?: string[]; username?: string[]; password?: string[] },
      status: error.status,
    };
  }
};

export const verifyEmail = async (token: string) => {
  const url = "/v1/auth/verify-email-token/";
  return await axiosPostCustomError(url, { token });
};

export const resendVerifyEmail = async (userId: number) => {
  const url = "/v1/auth/resend-verify-email-token/";
  return await axiosPostCustomError(url, { userId });
};
