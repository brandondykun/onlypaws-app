import { Announcement } from "@/types/announcements/announcements";

import { axiosInstance } from "./config";

export const getAnnouncements = async (excludeWelcome: boolean = true) => {
  let url = `/v1/announcements/`;

  if (excludeWelcome) {
    url += `?exclude_welcome=true`;
  }

  return await axiosInstance.get<Announcement[]>(url);
};
