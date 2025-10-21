import { useCallback } from "react";

import { getProfileDetails } from "@/api/profile";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { ProfileDetails } from "@/types";

import { useDataFetch } from "./useDataFetch";

const useProfileDetails = (profileId: number | string | null) => {
  const { authProfile } = useAuthProfileContext();

  const initialFetch = useCallback(async () => {
    if (!profileId) return { data: null, error: null };
    return await getProfileDetails(profileId);
  }, [profileId, authProfile.id]);

  const { data, setData, initialFetchComplete, hasInitialFetchError, refresh, refreshing } =
    useDataFetch<ProfileDetails>(initialFetch, {
      enabled: !!profileId,
    });

  return { loading: !initialFetchComplete, error: hasInitialFetchError, data, refreshing, refetch: refresh, setData };
};

export default useProfileDetails;
