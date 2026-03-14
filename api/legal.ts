import { TermsOfService } from "@/types/legal/terms-of-service";

import { axiosFetch, axiosPost } from "./config";

export const getCurrentTerms = async () => {
  const url = "/v1/legal/terms/current/";
  return await axiosFetch<TermsOfService>(url);
};

export const acceptTerms = async (termsId: number) => {
  const url = "/v1/legal/terms/accept/";
  return await axiosPost<{ detail: string }>(url, { terms_id: termsId });
};
