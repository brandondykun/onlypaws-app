import { useCallback, useEffect, useState } from "react";

import { getProfileDetails } from "@/api/profile";
import { useAuthProfileContext } from "@/context/AuthProfileContext";
import { ProfileDetails } from "@/types";

const useProfileDetails = (profileId: number | string | null) => {
  const [data, setData] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { authProfile } = useAuthProfileContext();

  const fetchProfileDetails = useCallback(async () => {
    if (profileId) {
      setLoading(true);
      setError("");
      setData(null);
      const { error, data } = await getProfileDetails(profileId, authProfile.id);
      if (!error && data) {
        setData(data);
      } else {
        setError("There was an error fetching that profile.");
      }
      setLoading(false);
    }
  }, [profileId, authProfile.id]);

  const refreshProfileDetails = async () => {
    setRefreshing(true);
    await fetchProfileDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [profileId, fetchProfileDetails]);

  return { loading, error, data, refreshing, refetch: refreshProfileDetails, setData };
};

export default useProfileDetails;
