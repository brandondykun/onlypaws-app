import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Platform } from "react-native";

export const BASE_URL = Platform.OS === "ios" ? "http://192.168.0.190:8000/api" : "http://192.168.0.190:8000/api";

export const axiosInstance = axios.create({ baseURL: BASE_URL });

export const axiosFetch = async <T>(url: string) => {
  try {
    const res = await axiosInstance.get<T>(url);
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const axiosPost = async <T>(url: string, data: any, config?: AxiosRequestConfig<any>) => {
  try {
    const res = await axiosInstance.post<T>(url, data, config);
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message, status: error.status };
  }
};

export const axiosDelete = async (url: string) => {
  try {
    const res = await axiosInstance.delete(url);
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

export const axiosPatch = async <T>(url: string, data: any, config?: AxiosRequestConfig<any>) => {
  try {
    const res = await axiosInstance.patch<T>(url, data, config);
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
  }
};

interface CustomErrorResponse {
  error: string;
  username?: string[];
}

export const axiosPostCustomError = async <T>(url: string, data: any, config?: AxiosRequestConfig<any>) => {
  try {
    const res = await axiosInstance.post<T>(url, data, config);
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    const data = error.response?.data as CustomErrorResponse;
    return { data: null, error: data.error, status: error.status };
  }
};

export const axiosPatchCustomError = async <T>(url: string, data: any, config?: AxiosRequestConfig<any>) => {
  try {
    const res = await axiosInstance.patch<T>(url, data, config);
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    const data = error.response?.data as CustomErrorResponse;
    let errorMessage = data.error;
    if (data.username && data.username[0] && data.username[0] === "profile with this username already exists.") {
      errorMessage = "Username taken. Please try a different username.";
    }
    return { data: null, error: errorMessage, status: error.status };
  }
};
