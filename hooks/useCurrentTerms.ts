import { useQuery } from "@tanstack/react-query";

import { getCurrentTerms } from "@/api/legal";
import { TermsOfService } from "@/types/legal/terms-of-service";
import { queryKeys } from "@/utils/query/queryKeys";

export const useCurrentTerms = () => {
  return useQuery({
    queryKey: queryKeys.currentTerms.root,
    queryFn: async (): Promise<TermsOfService> => {
      const { data, error } = await getCurrentTerms();
      if (error || !data) {
        throw new Error("Failed to fetch terms of service");
      }
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
