import { useState, useCallback, useEffect } from "react";

import { axiosFetch } from "@/api/config";

interface PaginatedResponse<T> {
  results: T[];
  next: string | null;
  previous: string | null;
  count: number;
  extra_data?: Record<string, any>;
}

interface UsePaginatedFetchResult<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  fetchNext: () => Promise<void>;
  fetchNextUrl: string | null;
  fetchNextLoading: boolean;
  hasFetchNextError: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
  totalCount: number;
  extraData: Record<string, any> | null;
}

interface FetchOptions {
  onRefresh?: () => void;
  enabled?: boolean;
}

// Custom hook for fetching paginated data.
// Pass in an initial fetch function and options.
// Returns values relevant for the paginated fetch lifecycle.

// Example implementation:

// const initialFetch = useCallback(async () => {
//   const { data, error } = await getFeed(authProfile.id);
//   return { data, error };
// }, [authProfile.id]);

// const {
//   data,
//   setData,
//   refresh,
//   refreshing,
//   initialFetchComplete,
//   hasInitialFetchError,
//   fetchNext,
//   fetchNextUrl,
//   fetchNextLoading,
//   hasFetchNextError,
// } = usePaginatedFetch<PostDetailed>(initialFetch, {
//   onRefresh: () => Haptics.impactAsync(),
//   enabled: !!authProfile.id,
// });

export function usePaginatedFetch<T>(
  initialFetchFn: () => Promise<{ data: PaginatedResponse<T> | null; error: any }>,
  options?: FetchOptions,
): UsePaginatedFetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [fetchNextUrl, setFetchNextUrl] = useState<string | null>(null);
  const [fetchNextLoading, setFetchNextLoading] = useState(false);
  const [hasFetchNextError, setHasFetchNextError] = useState(false);
  const [totalCount, setTotalCount] = useState(0); // total items in the paginated response, not just per page
  const [extraData, setExtraData] = useState<any>(null); // extra data to be used for the paginated fetch

  // Add reset effect when initialFetchFn changes
  useEffect(() => {
    setData([]);
    setRefreshing(false);
    setHasInitialFetchError(false);
    setInitialFetchComplete(false);
    setFetchNextUrl(null);
    setFetchNextLoading(false);
    setHasFetchNextError(false);
  }, [initialFetchFn]);

  const fetchInitial = useCallback(async () => {
    setHasInitialFetchError(false);
    setHasFetchNextError(false);
    const { data: responseData, error } = await initialFetchFn();

    if (responseData && !error) {
      setData(responseData.results);
      setFetchNextUrl(responseData.next);
      setTotalCount(responseData.count);
      setExtraData(responseData?.extra_data ?? null);
    } else {
      setHasInitialFetchError(true);
    }
    setInitialFetchComplete(true);
  }, [initialFetchFn]);

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchInitial();
    }
  }, [fetchInitial, options?.enabled]);

  const refresh = async () => {
    setRefreshing(true);
    options?.onRefresh?.();
    await fetchInitial();
    setRefreshing(false);
  };

  const fetchNext = useCallback(async () => {
    if (fetchNextUrl) {
      setFetchNextLoading(true);
      setHasFetchNextError(false);

      try {
        const response = await axiosFetch<PaginatedResponse<T>>(fetchNextUrl);
        const nextData = response.data;

        if (nextData && nextData.results) {
          setData((prev) => [...prev, ...nextData.results]);
          setFetchNextUrl(nextData.next);
        } else {
          setHasFetchNextError(true);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setHasFetchNextError(true);
      } finally {
        setFetchNextLoading(false);
      }
    }
  }, [fetchNextUrl]);

  return {
    data,
    setData,
    initialFetchComplete,
    hasInitialFetchError,
    fetchNext,
    fetchNextUrl,
    fetchNextLoading,
    hasFetchNextError,
    refresh,
    refreshing,
    totalCount,
    extraData,
  };
}
