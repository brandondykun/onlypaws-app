import { useInfiniteQuery, useQueryClient, InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Toast from "react-native-toast-message";

import {
  getFollowRequests,
  getSentFollowRequests,
  acceptFollowRequest,
  declineFollowRequest,
  cancelFollowRequest,
} from "@/api/interactions";
import {
  FollowRequest,
  FollowRequestWithStatus,
  SentFollowRequest,
  SentFollowRequestStatus,
  SentFollowRequestWithStatus,
  ListFollowRequestsResponse,
  ListSentFollowRequestsResponse,
} from "@/types/follow-requests/follow-requests";
import { WSFollowRequestNotification } from "@/types/notifications/follow-request";
import { WSFollowRequestAcceptedNotification } from "@/types/notifications/follow-request-accepted";
import { getNextPageParam } from "@/utils/utils";

import { useAuthProfileContext } from "./AuthProfileContext";
import { useAuthUserContext } from "./AuthUserContext";
import { useNotificationsContext } from "./NotificationsContext";
import { useProfileDetailsManagerContext } from "./ProfileDetailsManagerContext";

// ============================================================================
// Types
// ============================================================================

type FollowRequestsContextType = {
  // Received requests query & derived data
  receivedRequestsQuery: UseInfiniteQueryResult<InfiniteData<ListFollowRequestsResponse>, Error>;
  receivedRequests: FollowRequestWithStatus[];
  hasReceivedRequests: boolean;

  // Sent requests query & derived data
  sentRequestsQuery: UseInfiniteQueryResult<InfiniteData<ListSentFollowRequestsResponse>, Error>;
  sentRequests: SentFollowRequestWithStatus[];
  hasSentRequests: boolean;

  // Actions
  acceptRequest: (requestId: number) => Promise<void>;
  declineRequest: (requestId: number) => Promise<void>;
  cancelRequest: (profileId: number) => Promise<void>;

  // Helpers
  hasPendingRequestFrom: (profileId: number) => boolean;
  hasPendingRequestTo: (profileId: number) => boolean;
  getPendingRequestTo: (profileId: number) => SentFollowRequest | undefined;
};

// ============================================================================
// Context
// ============================================================================

const FollowRequestsContext = createContext<FollowRequestsContextType | null>(null);

// ============================================================================
// Provider
// ============================================================================

type Props = {
  children: React.ReactNode;
};

const FollowRequestsContextProvider = ({ children }: Props) => {
  const { selectedProfileId } = useAuthUserContext();
  const { wsNotifications, setPendingFollowRequestsCount } = useNotificationsContext();
  const { addFollower, addFollowing, authProfile } = useAuthProfileContext();
  const queryClient = useQueryClient();
  const profileDetailsManager = useProfileDetailsManagerContext();

  // Track processed notification IDs to prevent duplicate processing
  // Using string keys like "follow_request_123" since notification.id can be null for WS notifications
  const processedNotificationIds = useRef<Set<string>>(new Set());

  // Store follow requests received via websocket in local state
  // This ensures React re-renders when new requests arrive (more reliable than setQueryData alone)
  const [wsFollowRequests, setWsFollowRequests] = useState<FollowRequestWithStatus[]>([]);

  // ============================================================================
  // Query Keys
  // ============================================================================

  const receivedRequestsQueryKey = useMemo(
    () => [selectedProfileId, "follow-requests", "received"],
    [selectedProfileId],
  );

  const sentRequestsQueryKey = useMemo(() => [selectedProfileId, "follow-requests", "sent"], [selectedProfileId]);

  // ============================================================================
  // Fetch Functions
  // ============================================================================

  const fetchReceivedRequests = async ({ pageParam }: { pageParam: string }) => {
    const res = await getFollowRequests(pageParam);
    return res.data;
  };

  const fetchSentRequests = async ({ pageParam }: { pageParam: string }) => {
    const res = await getSentFollowRequests(pageParam);
    return res.data;
  };

  // ============================================================================
  // Infinite Queries
  // ============================================================================

  const receivedRequestsQuery = useInfiniteQuery({
    queryKey: receivedRequestsQueryKey,
    queryFn: fetchReceivedRequests,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId && !!authProfile.id,
  });

  const sentRequestsQuery = useInfiniteQuery({
    queryKey: sentRequestsQueryKey,
    queryFn: fetchSentRequests,
    initialPageParam: "1",
    getNextPageParam: (lastPage) => getNextPageParam(lastPage),
    enabled: !!selectedProfileId && !!authProfile.id,
  });

  // ============================================================================
  // Flattened Data
  // ============================================================================

  // Merge websocket follow requests with query data, deduplicating by id
  const receivedRequests = useMemo(() => {
    const queryRequests = receivedRequestsQuery.data?.pages.flatMap((page) => page.results) ?? [];
    const requestMap = new Map<number, FollowRequestWithStatus>();

    // Add query requests first (with default status), then websocket requests (which take precedence)
    queryRequests.forEach((req) => {
      // API data may have status if we've updated it via setQueryData, otherwise default to "pending"
      const reqWithStatus = req as FollowRequest & { status?: FollowRequestWithStatus["status"] };
      requestMap.set(req.id, { ...req, status: reqWithStatus.status ?? "pending" });
    });
    wsFollowRequests.forEach((req) => requestMap.set(req.id, req));

    // Sort by created_at (newest first)
    return Array.from(requestMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [receivedRequestsQuery.data, wsFollowRequests]);

  const sentRequests = useMemo(() => {
    const queryRequests = sentRequestsQuery.data?.pages.flatMap((page) => page.results) ?? [];
    return queryRequests.map((req) => {
      // Preserve existing status if set via setQueryData, otherwise default to "pending"
      const reqWithStatus = req as SentFollowRequest & { status?: SentFollowRequestStatus };
      return { ...req, status: reqWithStatus.status ?? "pending" };
    });
  }, [sentRequestsQuery.data]);

  // Sync pending follow requests count with NotificationsContext
  const pendingReceivedCount = useMemo(
    () => receivedRequests.filter((req) => req.status === "pending").length,
    [receivedRequests],
  );

  useEffect(() => {
    setPendingFollowRequestsCount(pendingReceivedCount);
  }, [pendingReceivedCount, setPendingFollowRequestsCount]);

  // ============================================================================
  // WebSocket Integration
  // ============================================================================

  // Listen to wsNotifications for follow_request and follow_request_accepted
  useEffect(() => {
    if (!wsNotifications.length || !selectedProfileId) return;

    wsNotifications.forEach((notification) => {
      if (notification.notification_type === "follow_request") {
        const followRequestNotification = notification as WSFollowRequestNotification;
        const extraData = followRequestNotification.extra_data;
        const processedKey = `follow_request_${extraData.follow_request_id}`;

        if (processedNotificationIds.current.has(processedKey)) return;

        const newRequest: FollowRequestWithStatus = {
          id: extraData.follow_request_id,
          requester: {
            id: extraData.requester_id,
            username: extraData.requester_username,
            image: extraData.requester_avatar
              ? {
                  id: 0,
                  image: extraData.requester_avatar,
                  profile: extraData.requester_id,
                  created_at: followRequestNotification.created_at,
                  updated_at: followRequestNotification.created_at,
                }
              : null,
            about: extraData.requester_about,
            name: extraData.requester_name,
            pet_type: null,
            breed: extraData.requester_breed ?? null,
            is_private: false,
            profile_type: extraData.requester_business_category ? "business" : "regular",
          },
          target: selectedProfileId,
          created_at: followRequestNotification.created_at,
          status: "pending",
        };

        setWsFollowRequests((prev) => {
          if (prev.some((req) => req.id === newRequest.id)) return prev;
          return [newRequest, ...prev];
        });

        processedNotificationIds.current.add(processedKey);
      }

      if (notification.notification_type === "follow_request_accepted") {
        const acceptedNotification = notification as WSFollowRequestAcceptedNotification;
        const extraData = acceptedNotification.extra_data;
        const processedKey = `follow_request_accepted_${extraData.followed_id}`;

        if (processedNotificationIds.current.has(processedKey)) return;

        addFollowing(); // add following to auth profile to update following count in the profile header
        profileDetailsManager.onFollowRequestAccepted(extraData.followed_id); // update the profile details throughout the app to show the accepted request
        queryClient.setQueryData<InfiniteData<ListSentFollowRequestsResponse>>(sentRequestsQueryKey, (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((req) =>
              req.target.id === extraData.followed_id ? { ...req, status: "accepted" as const } : req,
            ),
          }));

          return { ...oldData, pages: newPages };
        });

        processedNotificationIds.current.add(processedKey);
        profileDetailsManager.onFollowRequestAccepted(extraData.followed_id); // update the profile details throughout the app to show the accepted request
      }
    });
  }, [
    wsNotifications,
    selectedProfileId,
    queryClient,
    receivedRequestsQueryKey,
    sentRequestsQueryKey,
    addFollowing,
    profileDetailsManager,
  ]);

  // Clear processed IDs and websocket requests when profile changes
  useEffect(() => {
    processedNotificationIds.current.clear();
    setWsFollowRequests([]);
  }, [selectedProfileId]);

  // Clean up wsFollowRequests when query data is fetched/re-fetched
  // Remove items that are now in the query data to prevent memory buildup
  useEffect(() => {
    if (!receivedRequestsQuery.data?.pages.length) return;

    const queryRequestIds = new Set(
      receivedRequestsQuery.data.pages.flatMap((page) => page.results.map((req) => req.id)),
    );

    setWsFollowRequests((prev) => {
      const filtered = prev.filter((req) => !queryRequestIds.has(req.id));
      // Only update if there are items to remove
      return filtered.length !== prev.length ? filtered : prev;
    });
  }, [receivedRequestsQuery.data]);

  // ============================================================================
  // Actions
  // ============================================================================

  const acceptRequest = useCallback(
    async (requestId: number) => {
      try {
        const res = await acceptFollowRequest(requestId);
        console.log("[FollowRequests] acceptRequest response:", res.data);

        // Update status in websocket requests state
        setWsFollowRequests((prev) =>
          prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" as const } : req)),
        );

        // Update status in received requests cache
        queryClient.setQueryData<InfiniteData<ListFollowRequestsResponse>>(receivedRequestsQueryKey, (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((req) => (req.id === requestId ? { ...req, status: "accepted" as const } : req)),
          }));

          return { ...oldData, pages: newPages };
        });
        // Add follower to auth profile to update followers count in the profile header
        addFollower();
      } catch (error) {
        console.error("Failed to accept follow request:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to accept follow request",
          visibilityTime: 3000,
        });
        throw error;
      }
    },
    [queryClient, receivedRequestsQueryKey, addFollower],
  );

  const declineRequest = useCallback(
    async (requestId: number) => {
      try {
        await declineFollowRequest(requestId);

        // Update status in websocket requests state
        setWsFollowRequests((prev) =>
          prev.map((req) => (req.id === requestId ? { ...req, status: "declined" as const } : req)),
        );

        // Update status in received requests cache
        queryClient.setQueryData<InfiniteData<ListFollowRequestsResponse>>(receivedRequestsQueryKey, (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((req) => (req.id === requestId ? { ...req, status: "declined" as const } : req)),
          }));

          return { ...oldData, pages: newPages };
        });
      } catch (error) {
        console.error("Failed to decline follow request:", error);
        Toast.show({
          type: "error",
          text1: "Failed to decline follow request",
          visibilityTime: 3000,
        });
        throw error;
      }
    },
    [queryClient, receivedRequestsQueryKey],
  );

  const cancelRequest = useCallback(
    async (profileId: number) => {
      try {
        await cancelFollowRequest(profileId);

        // Remove from sent requests cache
        queryClient.setQueryData<InfiniteData<ListSentFollowRequestsResponse>>(sentRequestsQueryKey, (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((req) =>
              req.target.id === profileId ? { ...req, status: "cancelled" as const } : req,
            ),
          }));

          return { ...oldData, pages: newPages };
        });
      } catch (error) {
        console.error("Failed to cancel follow request:", error);
        Toast.show({
          type: "error",
          text1: "Failed to cancel follow request",
          visibilityTime: 3000,
        });
        throw error;
      }
    },
    [queryClient, sentRequestsQueryKey],
  );

  // ============================================================================
  // Helpers
  // ============================================================================

  const hasPendingRequestFrom = useCallback(
    (profileId: number) => {
      return receivedRequests.some((req) => req.requester.id === profileId && req.status === "pending");
    },
    [receivedRequests],
  );

  const hasPendingRequestTo = useCallback(
    (profileId: number) => {
      return sentRequests.some((req) => req.target.id === profileId);
    },
    [sentRequests],
  );

  const getPendingRequestTo = useCallback(
    (profileId: number) => {
      return sentRequests.find((req) => req.target.id === profileId);
    },
    [sentRequests],
  );

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: FollowRequestsContextType = {
    // Received requests query & derived data
    receivedRequestsQuery,
    receivedRequests,
    hasReceivedRequests: receivedRequests.filter((req) => req.status === "pending").length > 0,

    // Sent requests query & derived data
    sentRequestsQuery,
    sentRequests,
    hasSentRequests: sentRequests.filter((req) => req.status === "pending").length > 0,

    // Actions
    acceptRequest,
    declineRequest,
    cancelRequest,

    // Helpers
    hasPendingRequestFrom,
    hasPendingRequestTo,
    getPendingRequestTo,
  };

  return <FollowRequestsContext.Provider value={value}>{children}</FollowRequestsContext.Provider>;
};

export default FollowRequestsContextProvider;

export const useFollowRequestsContext = (): FollowRequestsContextType => {
  const context = useContext(FollowRequestsContext);
  if (!context) {
    throw new Error("useFollowRequestsContext must be used within FollowRequestsContextProvider");
  }
  return context;
};
