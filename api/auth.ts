import axios, { AxiosError } from "axios";

import { Tokens, AccessToken, UserProfile, MyInfo } from "../types";

import { axiosInstance } from "./config";
import { BASE_URL } from "./config";

export const login = async (email: string, password: string) => {
  try {
    const res = await axiosInstance.post<Tokens>(`${BASE_URL}/v1/auth/login/`, {
      email,
      password,
    });
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message, status: error.status };
  }
};

export const refreshToken = async (refresh: string) => {
  try {
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
  try {
    const res = await axiosInstance.get<MyInfo>("/v1/auth/my-info/");
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const registerUser = async (email: string, password: string, username: string) => {
  try {
    const res = await axiosInstance.post<UserProfile>("/v1/auth/create-user/", {
      email,
      password,
      username,
    });
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};
