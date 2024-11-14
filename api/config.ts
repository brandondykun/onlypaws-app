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
    return { data: res.data, error: null };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message };
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
