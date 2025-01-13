import * as Haptics from "expo-haptics";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getReportReasons } from "@/api/report";
import { ReportReason } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";

type ReportReasonsContextType = {
  data: ReportReason[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  refreshing: boolean;
};

const ReportReasonsContext = createContext<ReportReasonsContextType>({
  data: [],
  loading: true,
  error: "",
  refetch: () => Promise.resolve(),
  refreshing: false,
});

type Props = {
  children: React.ReactNode;
};

const ReportReasonsContextProvider = ({ children }: Props) => {
  const { authProfile } = useAuthProfileContext();

  const [data, setData] = useState<ReportReason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // TODO: retry fetch if fails
  const fetchSavedPosts = useCallback(async () => {
    if (authProfile?.id) {
      setLoading(true);
      setError("");
      const { error, data } = await getReportReasons();
      if (!error && data) {
        const nonOtherReasons: ReportReason[] = [];
        const otherReason: ReportReason[] = [];

        data.results.forEach((reason) => {
          if (reason.name.toLowerCase() === "other") {
            otherReason.push(reason);
          } else {
            nonOtherReasons.push(reason);
          }
        });

        setData([...nonOtherReasons, ...otherReason]);
      } else {
        setError("There was an error fetching report reasons.");
      }
    }
  }, [authProfile]);

  useEffect(() => {
    fetchSavedPosts();
  }, [authProfile, fetchSavedPosts]);

  const refreshPosts = async () => {
    setRefreshing(true);
    Haptics.impactAsync();
    await fetchSavedPosts();
    setRefreshing(false);
  };

  const value = {
    data,
    loading,
    error,
    refetch: refreshPosts,
    refreshing,
  };

  return <ReportReasonsContext.Provider value={value}>{children}</ReportReasonsContext.Provider>;
};

export default ReportReasonsContextProvider;

export const useReportReasonsContext = () => {
  const { data, loading, error, refetch, refreshing } = useContext(ReportReasonsContext);
  return { data, loading, error, refetch, refreshing };
};
