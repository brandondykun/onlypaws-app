import { AxiosError } from "axios";

import { axiosInstance } from "./config";

export const checkText = async (
  text: string,
): Promise<{
  allowed: boolean;
  message: string | null;
  error: string | null;
}> => {
  try {
    const res = await axiosInstance.post<{ allowed: boolean; message?: string }>("/v1/moderation/check-text/", {
      text,
    });
    return {
      allowed: res.data.allowed,
      message: res.data.message ?? null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError;
    return { allowed: true, message: null, error: error.message };
  }
};
