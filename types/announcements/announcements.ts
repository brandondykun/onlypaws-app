export type AnnouncementPriority = "low" | "normal" | "high";

export type Announcement = {
  id: number;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  announcement_type: string;
};
