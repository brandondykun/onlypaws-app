import { Profile } from "@/types";
import { PaginatedResponse } from "@/types/shared/pagination";

import { axiosFetch, axiosPost, axiosDelete } from "./config";

export type BlockedProfile = {
  id: number;
  blocked_profile: Profile;
  created_at: string;
};

export const getBlockedProfiles = async (page: string) => {
  const url = `/v1/moderation/block/list/?page=${page}`;
  return await axiosFetch<PaginatedResponse<BlockedProfile>>(url);
};

export const blockProfile = async (profilePublicId: string) => {
  return axiosPost("/v1/moderation/block/", {
    profile_id: profilePublicId,
  });
};

export const unblockProfile = async (profilePublicId: string) => {
  return axiosDelete(`/v1/moderation/block/${profilePublicId}/`);
};
