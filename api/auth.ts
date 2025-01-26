import axios, { AxiosError } from "axios";

import { Tokens, AccessToken, UserProfile, MyInfo } from "../types";

import { axiosPost, axiosFetch, axiosPostCustomError } from "./config";
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

export const registerUser = async (email: string, password: string, username: string) => {
  const url = "/v1/auth/create-user/";
  return await axiosPost<UserProfile>(url, { email, password, username });
};

export const verifyEmail = async (token: string) => {
  const url = "/v1/auth/verify-email-token/";
  return await axiosPostCustomError(url, { token });
};

export const resendVerifyEmail = async (userId: number) => {
  const url = "/v1/auth/resend-verify-email-token/";
  return await axiosPostCustomError(url, { userId });
};
