import { useState, useCallback, useEffect } from "react";

interface UseDataFetchResult<T> {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
}

interface FetchOptions {
  onRefresh?: () => void;
  enabled?: boolean;
}

/**
 * Custom hook for fetching non-paginated data with standardized loading states.
 * @param initialFetchFn - Function that performs the initial data fetch
 * @param options - Optional configuration for fetch behavior
 *
 * @example
 * const initialFetch = useCallback(async () => {
 *   const { data, error } = await getProfileDetails(profileId);
 *   return { data, error };
 * }, [profileId]);
 *
 * const {
 *   data,
 *   setData,
 *   refresh,
 *   refreshing,
 *   initialFetchComplete,
 *   hasInitialFetchError,
 * } = useDataFetch<ProfileDetails>(initialFetch, {
 *   onRefresh: () => Haptics.impactAsync(),
 *   enabled: !!profileId,
 * });
 */
export function useDataFetch<T>(
  initialFetchFn: () => Promise<{ data: T | null; error: any }>,
  options?: FetchOptions,
): UseDataFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);

  // Reset all fetch lifecycle states when the fetch function changes
  useEffect(() => {
    setData(null);
    setRefreshing(false);
    setHasInitialFetchError(false);
    setInitialFetchComplete(false);
  }, [initialFetchFn]);

  // Main data fetch implementation
  const fetchInitial = useCallback(async () => {
    setHasInitialFetchError(false);

    const { data: responseData, error } = await initialFetchFn();

    if (responseData && !error) {
      setData(responseData);
    } else {
      setHasInitialFetchError(true);
    }
    setInitialFetchComplete(true);
  }, [initialFetchFn]);

  // Trigger initial fetch when enabled
  useEffect(() => {
    if (options?.enabled !== false) {
      fetchInitial();
    }
  }, [fetchInitial, options?.enabled]);

  // Refresh function that can be called to manually refresh the data
  const refresh = async () => {
    setRefreshing(true);
    options?.onRefresh?.();
    await fetchInitial();
    setRefreshing(false);
  };

  return {
    data,
    setData,
    initialFetchComplete,
    hasInitialFetchError,
    refresh,
    refreshing,
  };
}
