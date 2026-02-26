import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { getProfileReportReasons } from "@/api/profile-report";
import { ProfileReportReason } from "@/types";
import { queryKeys } from "@/utils/query/queryKeys";

type ProfileReportReasonsContextType = {
  data: ProfileReportReason[];
  initialFetchComplete: boolean;
  hasInitialFetchError: boolean;
  refetch: () => Promise<void>;
  refreshing: boolean;
};

const ProfileReportReasonsContext = createContext<ProfileReportReasonsContextType>({
  data: [],
  initialFetchComplete: false,
  hasInitialFetchError: false,
  refetch: () => Promise.resolve(),
  refreshing: false,
});

type Props = {
  children: React.ReactNode;
};

const ProfileReportReasonsContextProvider = ({ children }: Props) => {
  const { data, isFetched, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.profileReportReasons.root,
    queryFn: () => getProfileReportReasons(),
  });

  // Reorder report reasons so that "Other" is last
  const nonOtherReasons: ProfileReportReason[] = [];
  const otherReason: ProfileReportReason[] = [];

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

  return <ProfileReportReasonsContext.Provider value={value}>{children}</ProfileReportReasonsContext.Provider>;
};

export default ProfileReportReasonsContextProvider;

export const useProfileReportReasonsContext = () => {
  const { data, initialFetchComplete, hasInitialFetchError, refetch, refreshing } =
    useContext(ProfileReportReasonsContext);
  return { data, initialFetchComplete, hasInitialFetchError, refetch, refreshing };
};
