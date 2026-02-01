import { useQuery } from "@tanstack/react-query";

import { getPetTypeOptions } from "@/api/profile";
import { PetTypeWithTitle } from "@/types";
import { queryKeys } from "@/utils/query/queryKeys";

/**
 * Hook to fetch and cache pet type options for dropdowns.
 * Uses TanStack Query to deduplicate requests across components.
 */
export const usePetTypeOptions = () => {
  return useQuery({
    queryKey: queryKeys.petTypeOptions.root,
    queryFn: async (): Promise<PetTypeWithTitle[]> => {
      const { data, error } = await getPetTypeOptions();
      if (error || !data) {
        throw new Error("Failed to fetch pet type options");
      }
      // Format the data for dropdown component (adds title for DropdownSelect)
      return data.map((item) => ({
        ...item,
        title: item.name,
      }));
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - pet types rarely change
  });
};
