import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import Toast from "react-native-toast-message";

import { BASE_URL } from "@/api/config";
import {
  getNotifications,
  markAllAsRead as markAllAsReadAPI,
  markNotificationAsRead as markNotificationAsReadAPI,
} from "@/api/notifications";
import { useAuthUserContext } from "@/context/AuthUserContext";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { DBNotification, WSNotification } from "@/types/notifications/base";

export type NotificationContextType = {
  // WebSocket connection status
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";

  // Combined notifications data (DB + WebSocket)
  allNotifications: (DBNotification | WSNotification)[];
  unreadCount: number;

  // Pagination controls (exposed from usePaginatedFetch)
  refresh: () => Promise<void>;
  refreshing: boolean;
  fetchNext: () => Promise<void>;
  fetchNextLoading: boolean;
  fetchNextUrl: string | null;
  hasInitialFetchError: boolean;
  hasFetchNextError: boolean;
  initialFetchComplete: boolean;

  // Notification actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAllAsReadLoading: boolean;
  clearNotifications: () => void;

  // Helper functions
  formatNotificationMessage: (notification: WSNotification) => string;

  wsNotifications: WSNotification[];
};

// Create context with default values
const NotificationsContext = createContext<NotificationContextType>({
  // WebSocket connection status
  isConnected: false,
  connectionStatus: "disconnected",

  // Combined notifications data
  allNotifications: [],
  unreadCount: 0,

  // Pagination controls
  refresh: async () => {},
  refreshing: false,
  fetchNext: async () => {},
  fetchNextLoading: false,
  fetchNextUrl: null,
  hasInitialFetchError: false,
  hasFetchNextError: false,
  initialFetchComplete: false,

  // Notification actions
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  markAllAsReadLoading: false,
  clearNotifications: () => {},

  // Helper functions
  formatNotificationMessage: (notification) => notification.message,

  wsNotifications: [],
});

type Props = {
  children: React.ReactNode;
};

const NotificationsContextProvider = ({ children }: Props) => {
  const { isAuthenticated, selectedProfileId } = useAuthUserContext();

  // Initialize paginated fetch for DB notifications
  const initialFetch = useCallback(async () => {
    const { data, error } = await getNotifications();
    return { data, error };
  }, []);

  // Use paginated fetch hook for DB notifications
  const {
    data: dbNotifications,
    setData: setDbNotifications,
    refresh: refreshDbNotifications,
    refreshing: refreshingDbNotifications,
    initialFetchComplete: initialFetchCompleteDbNotifications,
    hasInitialFetchError: hasInitialFetchErrorDbNotifications,
    fetchNext: fetchNextDbNotifications,
    fetchNextUrl: fetchNextUrlDbNotifications,
    fetchNextLoading: fetchNextLoadingDbNotifications,
    hasFetchNextError: hasFetchNextErrorDbNotifications,
  } = usePaginatedFetch<DBNotification>(initialFetch, {
    enabled: !!selectedProfileId && isAuthenticated,
  });

  // WebSocket notifications state (recent notifications received while app is open)
  const [wsNotifications, setWsNotifications] = useState<WSNotification[]>([]);

  // WebSocket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  );

  // Mark all as read loading state
  const [markAllAsReadLoading, setMarkAllAsReadLoading] = useState(false);

  // WebSocket connection refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const serverErrorCountRef = useRef(0);
  const maxReconnectAttempts = 10;
  const maxServerErrors = 5; // Disable after 5 consecutive server errors
  const baseReconnectDelay = 1000; // 1 second
  const maxReconnectDelay = 30000; // 30 seconds

  // Auto-refresh debounce ref to prevent too frequent DB refreshes
  const autoRefreshTimeoutRef = useRef<number | null>(null);

  // Ref to store the latest refresh function to avoid dependency issues
  const refreshRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // App state tracking
  const appStateRef = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appStateRef.current);

  // Smart merge of DB and WebSocket notifications with deduplication
  const allNotifications = useMemo(() => {
    // Only show recent WebSocket notifications (last 50 to avoid performance issues)
    const recentWsNotifications = wsNotifications.slice(0, 50);

    // Create a Map to handle deduplication efficiently
    const notificationMap = new Map<number, DBNotification | WSNotification>();

    // Add WebSocket notifications first (they are more recent and should take precedence)
    recentWsNotifications.forEach((wsNotif) => {
      notificationMap.set(wsNotif.id, wsNotif);
    });

    // Add DB notifications (won't override existing WebSocket notifications due to Map behavior)
    dbNotifications.forEach((dbNotif) => {
      if (!notificationMap.has(dbNotif.id)) {
        notificationMap.set(dbNotif.id, dbNotif);
      }
    });

    // Convert Map values to array and sort by creation date (newest first)
    return Array.from(notificationMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [wsNotifications, dbNotifications]);

  // Calculate total unread count from combined notifications
  const unreadCount = allNotifications.filter((notification) => !notification.is_read).length;

  // Custom refresh function that also cleans up WebSocket notifications
  const refresh = useCallback(async () => {
    await refreshDbNotifications();

    // After refreshing DB notifications, remove WebSocket notifications that are now persisted in DB
    // This prevents duplicates and keeps the WebSocket array lean
    setWsNotifications((prev) => {
      const beforeCount = prev.length;
      const filtered = prev.filter((wsNotif) => !dbNotifications.some((dbNotif) => dbNotif.id === wsNotif.id));
      const afterCount = filtered.length;
      const cleanedUp = beforeCount - afterCount;

      if (cleanedUp > 0) {
        console.log(
          `Cleaned up ${cleanedUp} WebSocket notifications that are now in DB (${beforeCount} → ${afterCount})`,
        );
      }

      return filtered;
    });
  }, [refreshDbNotifications, dbNotifications]);

  // Store the latest refresh function in ref to avoid dependency chain issues
  refreshRef.current = refresh;

  const formatNotificationMessage = useCallback((notification: WSNotification) => {
    const senderName = notification.sender_username || "Someone";

    switch (notification.notification_type) {
      case "like_post":
        return `${senderName} liked your post`;
      case "like_comment":
        if (notification.comment_id) {
          return `${senderName} liked your comment`;
        }
      default:
        return notification.message;
    }
  }, []);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(async () => {
    if (!selectedProfileId) {
      console.log("No selected profile ID available for WebSocket connection");
      return null;
    }

    try {
      const token = await SecureStore.getItemAsync("ACCESS_TOKEN");
      if (!token) {
        console.log("No access token available for WebSocket connection");
        return null;
      }

      // Validate token format (basic JWT check)
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Invalid token format - not a valid JWT");
        return null;
      }

      // Convert HTTP URL to WebSocket URL and remove /api suffix if present
      let wsBaseUrl = BASE_URL?.replace("http://", "ws://").replace("https://", "wss://");
      if (wsBaseUrl?.endsWith("/api")) {
        wsBaseUrl = wsBaseUrl.slice(0, -4); // Remove '/api' suffix
      }

      const wsUrl = `${wsBaseUrl}/ws/notifications/${selectedProfileId}/?token=${token}`;
      console.log("Generated WebSocket URL:", wsUrl.replace(token, "[TOKEN_HIDDEN]"));

      return wsUrl;
    } catch (error) {
      console.error("Error getting WebSocket URL:", error);
      return null;
    }
  }, [selectedProfileId]);

  // Show notification using toast
  const showNotification = useCallback(
    (notification: WSNotification) => {
      // format the notification message for different notification types
      const formattedMessage = formatNotificationMessage(notification);
      Toast.show({
        type: "notification",
        text1: formattedMessage,
        visibilityTime: 3000,
        autoHide: true,
        props: {
          imageUri: notification.sender_avatar,
        },
      });
    },
    [formatNotificationMessage],
  );

  // Helper function to handle incoming WebSocket notifications with deduplication and auto-cleanup
  const handleIncomingNotification = useCallback(
    (notificationData: WSNotification) => {
      // Add to WebSocket notifications list (will be merged with DB notifications)
      setWsNotifications((prev) => {
        // Prevent duplicates by checking if notification already exists
        const exists = prev.some((existingNotif) => existingNotif.id === notificationData.id);
        if (exists) return prev;

        // Add new notification at the beginning (newest first)
        const newNotifications = [{ ...notificationData, is_read: false }, ...prev];

        // Check if we've reached the 50-item limit for automatic cleanup
        if (newNotifications.length >= 50) {
          console.log(
            `WebSocket notifications reached ${newNotifications.length} items, triggering automatic DB refresh for cleanup`,
          );

          // Clear any existing auto-refresh timeout to prevent multiple rapid refreshes
          if (autoRefreshTimeoutRef.current) {
            clearTimeout(autoRefreshTimeoutRef.current);
          }

          // Trigger DB refresh asynchronously with debounce to prevent too frequent refreshes
          // This prevents memory buildup during long foreground sessions
          autoRefreshTimeoutRef.current = setTimeout(() => {
            refreshRef.current?.();
            autoRefreshTimeoutRef.current = null;
          }, 500); // 500ms delay to debounce rapid notifications and avoid blocking WebSocket processing
        }

        return newNotifications;
      });

      // Show toast notification only if app is in foreground
      if (appStateVisible === "active") {
        showNotification(notificationData);
      }
    },
    [appStateVisible, showNotification],
  );

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!isAuthenticated || !selectedProfileId || appStateVisible !== "active") {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = await getWebSocketUrl();
    if (!wsUrl) {
      console.log("No WebSocket URL available");
      return;
    }

    try {
      setConnectionStatus("connecting");
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        serverErrorCountRef.current = 0; // Reset server error count on successful connection

        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "notification") {
            const notificationData: WSNotification = data.notification;
            handleIncomingNotification(notificationData);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        console.error("Connection status:", connectionStatus);
        setConnectionStatus("error");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);

        setIsConnected(false);
        setConnectionStatus("disconnected");
        wsRef.current = null;

        // Handle specific error codes
        if (event.code === 1006) {
          console.error("WebSocket connection failed - likely server error (500)");
          serverErrorCountRef.current += 1;

          // Check if we've hit too many server errors
          if (serverErrorCountRef.current >= maxServerErrors) {
            console.error(`Too many server errors (${serverErrorCountRef.current}). Disabling WebSocket reconnection.`);
            setConnectionStatus("error");
            return;
          }

          // For 500 errors, wait longer before reconnecting
          if (isAuthenticated && selectedProfileId && appStateVisible === "active") {
            console.log(
              `Server error detected (${serverErrorCountRef.current}/${maxServerErrors}), scheduling reconnect with longer delay`,
            );
            scheduleReconnect(true); // Pass true to indicate server error
          }
        } else if (event.code !== 1000 && isAuthenticated && selectedProfileId && appStateVisible === "active") {
          // Attempt reconnection if not a normal closure and user is still authenticated
          scheduleReconnect(false);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setConnectionStatus("error");
      scheduleReconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedProfileId, appStateVisible, getWebSocketUrl, handleIncomingNotification]);

  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(
    (isServerError: boolean = false) => {
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.log("Max reconnection attempts reached");
        setConnectionStatus("error");
        return;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // For server errors (500), use longer delays
      const baseDelay = isServerError ? baseReconnectDelay * 3 : baseReconnectDelay;
      const maxDelay = isServerError ? maxReconnectDelay * 2 : maxReconnectDelay;

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current) + Math.random() * 1000, maxDelay);

      console.log(
        `Scheduling reconnect attempt ${reconnectAttemptsRef.current + 1} in ${delay}ms${isServerError ? " (server error detected)" : ""}`,
      );

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        connect();
      }, delay);
    },
    [connect],
  );

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (autoRefreshTimeoutRef.current) {
      clearTimeout(autoRefreshTimeoutRef.current);
      autoRefreshTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus("disconnected");
    reconnectAttemptsRef.current = 0;
    serverErrorCountRef.current = 0; // Reset server error count on manual disconnect
  }, []);

  // Mark notification as read (works on both DB and WebSocket notifications)
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const numericId = Number(notificationId);

      const { error } = await markNotificationAsReadAPI(notificationId);

      if (error) {
        console.error("Failed to mark notification as read:", error);
        throw new Error("Failed to mark notification as read");
      }

      // Update WebSocket notifications
      setWsNotifications((prev) =>
        prev.map((notification) => (notification.id === numericId ? { ...notification, is_read: true } : notification)),
      );

      // Update DB notifications in the paginated fetch data
      setDbNotifications((prev) =>
        prev.map((notification) => (notification.id === numericId ? { ...notification, is_read: true } : notification)),
      );
    },
    [setDbNotifications],
  );

  // Mark all notifications as read (both DB and WebSocket) with API call
  const markAllAsRead = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (markAllAsReadLoading) {
      console.log("Mark all as read already in progress, skipping...");
      return;
    }

    try {
      setMarkAllAsReadLoading(true);
      console.log("Marking all notifications as read via API...");

      // Make API call to mark all notifications as read on the server
      const { error } = await markAllAsReadAPI();

      if (error) {
        console.error("Failed to mark all notifications as read:", error);
        throw new Error("Failed to mark notifications as read");
      }

      // Only update local state after successful API call
      // Mark all WebSocket notifications as read
      setWsNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));

      // Mark all DB notifications as read
      setDbNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      throw error; // Re-throw so calling component can handle the error
      // child component should handle the error and show toast notification
    } finally {
      setMarkAllAsReadLoading(false);
    }
  }, [markAllAsReadLoading, setDbNotifications]);

  // Clear all notifications (both WebSocket and DB)
  const clearNotifications = useCallback(() => {
    setWsNotifications([]);
    setDbNotifications([]);
  }, [setDbNotifications]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
      setAppStateVisible(nextAppState);

      if (nextAppState === "active") {
        // App came to foreground - connect WebSocket and refresh DB notifications
        connect();

        // Refresh DB notifications to get any notifications that arrived while app was in background
        // This will also trigger cleanup of WebSocket notifications via the refresh callback
        refresh();
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        // App went to background - disconnect WebSocket
        disconnect();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [connect, disconnect, refresh]);

  // Connect when authenticated and profile selected
  useEffect(() => {
    if (isAuthenticated && selectedProfileId && appStateVisible === "active") {
      // Only connect WebSocket here - don't refresh DB as usePaginatedFetch handles initial fetch
      // The app state change handler will handle refresh on foreground transitions
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      disconnect();
    };
  }, [isAuthenticated, selectedProfileId, connect, disconnect, appStateVisible]);

  const value: NotificationContextType = {
    // WebSocket connection status
    isConnected,
    connectionStatus,

    // Combined notifications data (primary interface)
    allNotifications,
    unreadCount,

    // Pagination controls (exposed from usePaginatedFetch)
    refresh,
    refreshing: refreshingDbNotifications,
    fetchNext: fetchNextDbNotifications,
    fetchNextLoading: fetchNextLoadingDbNotifications,
    fetchNextUrl: fetchNextUrlDbNotifications,
    hasInitialFetchError: hasInitialFetchErrorDbNotifications,
    hasFetchNextError: hasFetchNextErrorDbNotifications,
    initialFetchComplete: initialFetchCompleteDbNotifications,

    // Notification actions
    markAsRead,
    markAllAsRead,
    markAllAsReadLoading,
    clearNotifications,

    // Helper functions
    formatNotificationMessage,

    wsNotifications,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export default NotificationsContextProvider;

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotificationsContext must be used within NotificationsContextProvider");
  }
  return context;
};
