import axios, { AxiosError, AxiosRequestConfig } from "axios";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "mobile",
  },
});

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
    console.log("AxiosPost error: ", error);
    console.log("AxiosPost error response: ", error.response);
    console.log("AxiosPost error response data: ", error.response?.data);
    console.log("AxiosPost error response status: ", error.response?.status);
    console.log("AxiosPost error response headers: ", error.response?.headers);
    console.log("AxiosPost error response config: ", error.response?.config);
    console.log("AxiosPost error response request: ", error.response?.request);
    console.log("AxiosPost error response statusText: ", error.response?.statusText);
    console.log("AxiosPost error response headers: ", error.response?.headers);
    return { data: null, error: error.message, status: error.status };
  }
};

export const axiosDelete = async (url: string) => {
  try {
    const res = await axiosInstance.delete(url);
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message, status: error?.status };
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
