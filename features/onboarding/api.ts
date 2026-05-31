import { AxiosError } from "axios";

import { axiosInstance } from "@/api/config";
import type { MyInfo } from "@/features/auth/types";

export const completeOnboarding = async (profileType: "regular" | "business") => {
  const url = "/v1/auth/complete-onboarding/";
  try {
    const res = await axiosInstance.post<MyInfo>(url, {
      profile_type: profileType,
    });
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const error = err as AxiosError;
    return { data: null, error: error.message, status: error.status };
  }
};
