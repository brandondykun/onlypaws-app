import { createContext, useCallback, useContext } from "react";

import { getReportReasons } from "@/api/report";
import { useDataFetch } from "@/hooks/useDataFetch";
import { ReportReason } from "@/types";

import { useAuthProfileContext } from "./AuthProfileContext";
type ReportReasonsContextType = {
  data: ReportReason[];
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  refetch: () => Promise<void>;
  refreshing: boolean;
};

const ReportReasonsContext = createContext<ReportReasonsContextType>({
  data: [],
  initialFetchComplete: false,
  hasInitialFetchError: false,
  refetch: () => Promise.resolve(),
  refreshing: false,
});

type Props = {
  children: React.ReactNode;
};

const ReportReasonsContextProvider = ({ children }: Props) => {
  const { authProfile } = useAuthProfileContext();

  const initialFetch = useCallback(async () => {
    if (!authProfile.id) return { data: null, error: null };
    return await getReportReasons();
  }, [authProfile.id]);

  const { data, initialFetchComplete, hasInitialFetchError, refresh, refreshing } = useDataFetch<ReportReason[]>(
    initialFetch,
    {
      enabled: !!authProfile.id,
    },
  );

  // Reorder report reasons so that "Other" is last
  // The order of the reasons created here is the order they will be displayed in the UI
  const nonOtherReasons: ReportReason[] = [];
  const otherReason: ReportReason[] = [];

  data?.forEach((reason) => {
    if (reason.name.toLowerCase() === "other") {
      otherReason.push(reason);
    } else {
      nonOtherReasons.push(reason);
    }
  });

  const value = {
    data: [...nonOtherReasons, ...otherReason],
    initialFetchComplete,
    hasInitialFetchError,
    refetch: refresh,
    refreshing,
  };

  return <ReportReasonsContext.Provider value={value}>{children}</ReportReasonsContext.Provider>;
};

export default ReportReasonsContextProvider;

export const useReportReasonsContext = () => {
  const { data, initialFetchComplete, hasInitialFetchError, refetch, refreshing } = useContext(ReportReasonsContext);
  return { data, initialFetchComplete, hasInitialFetchError, refetch, refreshing };
};
