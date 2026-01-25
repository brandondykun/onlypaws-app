import { PaginatedDBNotificationsResponse } from "@/types/notifications/base";

import { axiosFetch, axiosPatch, axiosPost, axiosInstance } from "./config";

export const getNotifications = async (page: string = "1") => {
  const url = `/v1/notifications/?page=${page}`;
  return await axiosInstance.get<PaginatedDBNotificationsResponse>(url);
};

export const markNotificationAsRead = async (notificationId: string) => {
  const url = `/v1/notifications/${notificationId}/`;
  return await axiosPatch<{ is_read: boolean }>(url, { is_read: true });
};

export const markAllAsRead = async () => {
  const url = `/v1/notifications/mark-all-read/`;
  return await axiosPost<{ message: string; updated_count: string }>(url, {});
};

export const getNotificationCounts = async (profileId: string | number) => {
  const url = `/v1/notifications/counts/?profile_id=${profileId}`;
  return await axiosFetch<{ total_count: number; unread_count: number }>(url);
};
