import axios, { AxiosError } from "axios";
import { Platform } from "react-native";

export const BASE_URL = Platform.OS === "ios" ? "http://192.168.0.190:8000/api" : "http://10.0.2.2:8000/api";
// export const BASE_URL = Platform.OS === "ios" ? "http://0.0.0.0:8000/api" : "http://10.0.2.2:8000/api";
// export const BASE_URL = Platform.OS === "ios" ? "http://172.20.10.4:8000/api" : "http://172.20.10.4:8000/api";
// export const BASE_URL = Platform.OS === "ios" ? "http://172.20.10.2:8000/api" : "http://172.20.10.2:8000/api";
// export const BASE_URL = Platform.OS === "ios" ? "http://172.20.1.150:8000/api" : "http://172.20.1.150:8000/api";

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
