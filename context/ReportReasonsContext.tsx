import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { getReportReasons } from "@/api/report";
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
  const { selectedProfileId } = useAuthProfileContext();

  const { data, isFetched, isError, refetch, isRefetching } = useQuery({
    queryKey: ["reportReasons", selectedProfileId],
    queryFn: () => getReportReasons(),
  });

  // Reorder report reasons so that "Other" is last
  // The order of the reasons created here is the order they will be displayed in the UI
  const nonOtherReasons: ReportReason[] = [];
  const otherReason: ReportReason[] = [];

  data?.data?.forEach((reason) => {
    if (reason.name.toLowerCase() === "other") {
      otherReason.push(reason);
    } else {
      nonOtherReasons.push(reason);
    }
  });

  const value = {
    data: [...nonOtherReasons, ...otherReason],
    initialFetchComplete: isFetched,
    hasInitialFetchError: isError,
    refetch: async () => {
      await refetch();
    },
    refreshing: isRefetching,
  };

  return <ReportReasonsContext.Provider value={value}>{children}</ReportReasonsContext.Provider>;
};

export default ReportReasonsContextProvider;

export const useReportReasonsContext = () => {
  const { data, initialFetchComplete, hasInitialFetchError, refetch, refreshing } = useContext(ReportReasonsContext);
  return { data, initialFetchComplete, hasInitialFetchError, refetch, refreshing };
};
