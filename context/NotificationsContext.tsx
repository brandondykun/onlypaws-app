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
  fetch: () => Promise<void>;
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
  fetch: async () => {},
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
  // Include selectedProfileId so fetch resets when profile changes
  const initialFetch = useCallback(async () => {
    const { data, error } = await getNotifications();
    return { data, error };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfileId]);

  // Delay notifications fetch by 500ms on initial load to avoid racing with initial token refresh
  // The auth interceptor will handle 401s that occur during profile switches
  const [enableNotificationsFetch, setEnableNotificationsFetch] = useState(false);

  useEffect(() => {
    if (selectedProfileId && isAuthenticated) {
      const timer = setTimeout(() => {
        setEnableNotificationsFetch(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEnableNotificationsFetch(false);
    }
  }, [selectedProfileId, isAuthenticated]);

  // Use paginated fetch hook for DB notifications
  const {
    fetchInitial,
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
    enabled: enableNotificationsFetch,
  });

  // WebSocket notifications state (recent notifications received while app is open)
  const [wsNotifications, setWsNotifications] = useState<WSNotification[]>([]);

  // Track the previous profile ID to detect profile switches
  const prevProfileIdRef = useRef<number | null>(null);

  // Clear WebSocket notifications when profile changes
  // DB notifications are automatically cleared by usePaginatedFetch when initialFetch changes
  useEffect(() => {
    const isProfileSwitch = prevProfileIdRef.current !== null && prevProfileIdRef.current !== selectedProfileId;

    if (isProfileSwitch && selectedProfileId) {
      setWsNotifications([]);
    }

    prevProfileIdRef.current = selectedProfileId;
  }, [selectedProfileId]);

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
  const wsConnectedProfileIdRef = useRef<number | null>(null); // Track which profile the WebSocket is connected for
  const selectedProfileIdRef = useRef<number | null>(selectedProfileId); // Track current selected profile to avoid closure issues
  const connectionIdRef = useRef(0); // Unique ID for each connection to prevent old connections from processing messages
  const maxReconnectAttempts = 10;
  const maxServerErrors = 5; // Disable after 5 consecutive server errors
  const baseReconnectDelay = 1000; // 1 second
  const maxReconnectDelay = 30000; // 30 seconds

  // Auto-refresh debounce ref to prevent too frequent DB refreshes
  const autoRefreshTimeoutRef = useRef<number | null>(null);

  // Ref to store the latest refresh function to avoid dependency issues
  const refreshRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Ref to track if a notification toast is currently showing
  const isShowingNotificationRef = useRef(false);

  // App state tracking
  const appStateRef = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appStateRef.current);

  // Smart merge of DB and WebSocket notifications with deduplication
  // WebSocket notifications are real-time but ephemeral (stored in memory)
  // DB notifications are persistent but fetched with pagination
  // We merge both to provide a seamless UX
  // Note: follow_request notifications are excluded - they are handled by FollowRequestsContext
  const allNotifications = useMemo(() => {
    // Only show recent WebSocket notifications (last 50) to avoid performance issues
    // Filter out follow_request notifications - they are displayed separately in the follow requests UI
    const recentWsNotifications = wsNotifications.filter((n) => n.notification_type !== "follow_request").slice(0, 50);

    // Use Map for efficient deduplication by notification ID
    const notificationMap = new Map<number, DBNotification | WSNotification>();

    // Add WebSocket notifications first (most recent, should take precedence)
    recentWsNotifications.forEach((wsNotif) => {
      notificationMap.set(wsNotif.id, wsNotif);
    });

    // Add DB notifications (won't override existing WS notifications due to Map behavior)
    // Filter out follow_request notifications from DB as well
    dbNotifications.forEach((dbNotif) => {
      if (!notificationMap.has(dbNotif.id) && dbNotif.notification_type !== "follow_request") {
        notificationMap.set(dbNotif.id, dbNotif);
      }
    });

    // Convert to array and sort by creation date (newest first)
    return Array.from(notificationMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [wsNotifications, dbNotifications]);

  // Calculate total unread count from combined notifications
  const unreadCount = allNotifications.filter((notification) => !notification.is_read).length;

  // Custom refresh function that also cleans up WebSocket notifications
  const refresh = useCallback(async () => {
    await refreshDbNotifications();

    // Remove WebSocket notifications that are now persisted in DB
    setWsNotifications((prev) =>
      prev.filter((wsNotif) => !dbNotifications.some((dbNotif) => dbNotif.id === wsNotif.id)),
    );
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
      case "comment":
        if (notification.comment_id) {
          return `${senderName} commented on your post`;
        }
      case "comment_reply":
        if (notification.comment_id) {
          return `${senderName} replied to your comment`;
        }
      default:
        return notification.message;
    }
  }, []);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(async () => {
    if (!selectedProfileId) return null;

    try {
      const token = await SecureStore.getItemAsync("ACCESS_TOKEN");
      if (!token) return null;

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        return null;
      }

      let wsBaseUrl = BASE_URL?.replace("http://", "ws://").replace("https://", "wss://");
      if (wsBaseUrl?.endsWith("/api")) {
        wsBaseUrl = wsBaseUrl.slice(0, -4);
      }

      return `${wsBaseUrl}/ws/notifications/${selectedProfileId}/?token=${token}`;
    } catch (error) {
      console.error("Error getting WebSocket URL:", error);
      return null;
    }
  }, [selectedProfileId]);

  // Show notification using toast
  const showNotification = useCallback(
    (notification: WSNotification) => {
      // Don't show notification if one is already being displayed
      if (isShowingNotificationRef.current) {
        return;
      }

      isShowingNotificationRef.current = true;

      const formattedMessage = formatNotificationMessage(notification);
      Toast.show({
        type: "notification",
        text1: formattedMessage,
        visibilityTime: 3000,
        autoHide: true,
        onHide: () => {
          isShowingNotificationRef.current = false;
        },
        props: {
          imageUri: notification.sender_avatar,
        },
      });
    },
    [formatNotificationMessage],
  );

  // Handle incoming WebSocket notifications with deduplication and auto-cleanup
  const handleIncomingNotification = useCallback(
    (notificationData: WSNotification) => {
      setWsNotifications((prev) => {
        // Prevent duplicates - use a combination of fields since id can be null for WS notifications
        const getNotificationKey = (n: WSNotification) => {
          // If id is available, use it
          if (n.id != null) return `id_${n.id}`;
          // Otherwise, create a key from notification type and relevant data
          const baseKey = `${n.notification_type}_${n.created_at}`;
          // Add type-specific data to make the key unique
          if (n.extra_data) {
            const extraDataStr = JSON.stringify(n.extra_data);
            return `${baseKey}_${extraDataStr}`;
          }
          return baseKey;
        };

        const newKey = getNotificationKey(notificationData);
        const exists = prev.some((existingNotif) => getNotificationKey(existingNotif) === newKey);
        if (exists) return prev;

        const newNotifications = [{ ...notificationData, is_read: false }, ...prev];

        // Auto-cleanup when reaching 50 items to prevent memory buildup during long sessions
        // Trigger DB refresh with debounce to move WS notifications to persistent storage
        if (newNotifications.length >= 50) {
          if (autoRefreshTimeoutRef.current) {
            clearTimeout(autoRefreshTimeoutRef.current);
          }

          autoRefreshTimeoutRef.current = setTimeout(() => {
            refreshRef.current?.();
            autoRefreshTimeoutRef.current = null;
          }, 500); // 500ms debounce to prevent rapid refreshes
        }

        return newNotifications;
      });

      // Show toast notification only when app is in foreground
      if (appStateVisible === "active") {
        showNotification(notificationData);
      }
    },
    [appStateVisible, showNotification],
  );

  // Connect to WebSocket
  // This function only creates NEW connections - cleanup is handled by the effect
  const connect = useCallback(async () => {
    if (!isAuthenticated || !selectedProfileId || appStateVisible !== "active") {
      return;
    }

    const wsUrl = await getWebSocketUrl();
    if (!wsUrl) return;

    try {
      connectionIdRef.current += 1;
      const thisConnectionId = connectionIdRef.current;

      setConnectionStatus("connecting");

      // CRITICAL: Set profile ref IMMEDIATELY (before WebSocket opens)
      // This prevents duplicate connections when the effect runs multiple times
      // The effect's guard checks this ref, so it must be set synchronously
      wsConnectedProfileIdRef.current = selectedProfileId;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Ignore stale connections (connectionId was incremented after this connection started)
        if (thisConnectionId !== connectionIdRef.current) {
          ws.close(1000, "Stale connection");
          return;
        }

        setIsConnected(true);
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;
        serverErrorCountRef.current = 0;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        // Ignore messages from old connections
        if (thisConnectionId !== connectionIdRef.current) {
          return;
        }

        try {
          const data = JSON.parse(event.data);
          if (data.type === "notification") {
            handleIncomingNotification(data.notification);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        // Only process errors from current connection
        if (thisConnectionId !== connectionIdRef.current) {
          return;
        }

        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      ws.onclose = (event) => {
        // Only process close events from current connection
        if (thisConnectionId !== connectionIdRef.current) {
          return;
        }

        setIsConnected(false);
        setConnectionStatus("disconnected");
        wsRef.current = null;
        wsConnectedProfileIdRef.current = null;

        // Handle abnormal closures and reconnection
        // 1006 = abnormal closure (usually server error or network issue)
        // 1000 = normal closure (intentional disconnect)
        if (event.code === 1006) {
          serverErrorCountRef.current += 1;

          // Disable reconnection after too many consecutive server errors
          if (serverErrorCountRef.current >= maxServerErrors) {
            console.error(`Too many server errors, disabling reconnection`);
            setConnectionStatus("error");
            return;
          }

          if (isAuthenticated && selectedProfileId && appStateVisible === "active") {
            scheduleReconnect(true); // Use longer delays for server errors
          }
        } else if (event.code !== 1000 && isAuthenticated && selectedProfileId && appStateVisible === "active") {
          scheduleReconnect(false); // Use normal delays for other errors
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
        setConnectionStatus("error");
        return;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Use longer delays for server errors (3x base delay, 2x max delay)
      const baseDelay = isServerError ? baseReconnectDelay * 3 : baseReconnectDelay;
      const maxDelay = isServerError ? maxReconnectDelay * 2 : maxReconnectDelay;

      // Exponential backoff: 1s, 2s, 4s, 8s... + random jitter to prevent thundering herd
      const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current) + Math.random() * 1000, maxDelay);

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        connect();
      }, delay);
    },
    [connect],
  );

  // Disconnect WebSocket and clean up all related state
  const disconnect = useCallback(() => {
    // Clear all pending timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (autoRefreshTimeoutRef.current) {
      clearTimeout(autoRefreshTimeoutRef.current);
      autoRefreshTimeoutRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    // Reset all connection state
    setIsConnected(false);
    setConnectionStatus("disconnected");
    reconnectAttemptsRef.current = 0;
    serverErrorCountRef.current = 0;
    wsConnectedProfileIdRef.current = null;
  }, []);

  // Mark notification as read (works on both DB and WebSocket notifications)
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const numericId = Number(notificationId);

      const { error } = await markNotificationAsReadAPI(notificationId);

      if (error) {
        console.error("Failed to mark notification as read:", error);
        Toast.show({
          type: "error",
          text1: "Failed to mark notification as read",
          visibilityTime: 5000,
          autoHide: true,
        });
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
    if (markAllAsReadLoading) return;

    try {
      setMarkAllAsReadLoading(true);

      const { error } = await markAllAsReadAPI();

      if (error) {
        console.error("Failed to mark all notifications as read:", error);
        throw new Error("Failed to mark notifications as read");
      }

      setWsNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
      setDbNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      throw error;
    } finally {
      setMarkAllAsReadLoading(false);
    }
  }, [markAllAsReadLoading, setDbNotifications]);

  // Clear all notifications (both WebSocket and DB)
  const clearNotifications = useCallback(() => {
    setWsNotifications([]);
    setDbNotifications([]);
  }, [setDbNotifications]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
      setAppStateVisible(nextAppState);

      if (nextAppState === "active") {
        // App came to foreground
        // Refresh DB notifications to catch any that arrived during background
        // The main effect (line 557) will handle WebSocket reconnection
        refresh();
      }
      // Disconnection is handled by main effect when appStateVisible !== "active"
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [refresh]);

  // Handle profile switches and connection state
  // This effect manages the WebSocket lifecycle based on auth state, profile, and app visibility
  useEffect(() => {
    selectedProfileIdRef.current = selectedProfileId;

    // Clear any pending reconnection attempts when state changes
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
      reconnectAttemptsRef.current = 0;
    }

    const needsConnection = isAuthenticated && selectedProfileId && appStateVisible === "active";
    const alreadyConnectedToProfile = wsRef.current && wsConnectedProfileIdRef.current === selectedProfileId;

    if (needsConnection) {
      // Guard: Skip if already connected to the correct profile
      if (alreadyConnectedToProfile) {
        return;
      }

      // Close existing connection SYNCHRONOUSLY before connecting to new profile
      // This prevents cross-profile notifications and race conditions
      if (wsRef.current) {
        const oldWs = wsRef.current;

        // CRITICAL: Increment connection ID BEFORE clearing refs
        // This immediately invalidates any in-flight messages from the old connection
        connectionIdRef.current += 1;

        // Clear refs synchronously to stop all message processing immediately
        wsRef.current = null;
        wsConnectedProfileIdRef.current = null;
        setIsConnected(false);
        setConnectionStatus("disconnected");

        // Close the old WebSocket connection (async, but already invalidated by ID increment)
        try {
          oldWs.close(1000, "Profile changed");
        } catch (e) {
          console.error("Error closing WebSocket:", e);
        }
      }

      connect();
    } else {
      // Disconnect if auth/profile/app state doesn't allow connection
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, "Component unmount");
        } catch (e) {
          console.log("Error during WebSocket cleanup:", e);
        }
        wsRef.current = null;
        wsConnectedProfileIdRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedProfileId, appStateVisible]);

  const value: NotificationContextType = {
    // WebSocket connection status
    isConnected,
    connectionStatus,

    // Combined notifications data (primary interface)
    allNotifications,
    unreadCount,

    // Pagination controls (exposed from usePaginatedFetch)
    fetch: fetchInitial,
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
