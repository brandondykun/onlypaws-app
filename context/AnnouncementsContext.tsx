import { useQuery } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

import { getAnnouncements } from "@/api/announcements";
import { Announcement } from "@/types/announcements/announcements";
import { queryKeys } from "@/utils/query/queryKeys";

type AnnouncementsContextType = {
  announcements: Announcement[];
  dismissAnnouncement: (announcementId: number) => Promise<void>;
  isLoading: boolean;
};

const DISMISSED_ANNOUNCEMENTS_KEY = "dismissedAnnouncements";
export const SHOW_WELCOME_ANNOUNCEMENT_KEY = "showWelcomeAnnouncement";

const AnnouncementsContext = createContext<AnnouncementsContextType>({
  announcements: [],
  dismissAnnouncement: async () => {},
  isLoading: true,
});

type Props = {
  children: React.ReactNode;
};

const AnnouncementsContextProvider = ({ children }: Props) => {
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [includeWelcome, setIncludeWelcome] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load dismissed announcement IDs and check for welcome flag on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if we should include welcome announcement (first time after registration)
        const showWelcome = await SecureStore.getItemAsync(SHOW_WELCOME_ANNOUNCEMENT_KEY);
        if (showWelcome === "true") {
          setIncludeWelcome(true);
          // Clear the flag so it only happens once
          await SecureStore.deleteItemAsync(SHOW_WELCOME_ANNOUNCEMENT_KEY);
        }

        // Load dismissed announcement IDs
        const dismissed = await SecureStore.getItemAsync(DISMISSED_ANNOUNCEMENTS_KEY);
        if (dismissed) {
          setDismissedIds(JSON.parse(dismissed));
        }
      } catch {
        // If there's an error reading, start with empty array
        setDismissedIds([]);
      }
      setIsInitialized(true);
    };

    initialize();
  }, []);

  const { data, isLoading: isQueryLoading } = useQuery({
    queryKey: queryKeys.announcements.root(includeWelcome),
    queryFn: () => getAnnouncements(!includeWelcome), // excludeWelcome = !includeWelcome
    enabled: isInitialized, // Only run query after we've checked the welcome flag
  });

  // Dismiss an announcement
  const dismissAnnouncement = useCallback(
    async (announcementId: number) => {
      try {
        const newDismissedIds = [...dismissedIds, announcementId];
        await SecureStore.setItemAsync(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify(newDismissedIds));
        setDismissedIds(newDismissedIds);
      } catch (error) {
        console.error("Error dismissing announcement:", error);
      }
    },
    [dismissedIds],
  );

  // Filter out already dismissed announcements
  const announcements = data?.data?.filter((announcement) => !dismissedIds.includes(announcement.id)) ?? [];

  const value = {
    announcements,
    dismissAnnouncement,
    isLoading: isQueryLoading,
  };

  return <AnnouncementsContext.Provider value={value}>{children}</AnnouncementsContext.Provider>;
};

export default AnnouncementsContextProvider;

export const useAnnouncements = () => {
  return useContext(AnnouncementsContext);
};
