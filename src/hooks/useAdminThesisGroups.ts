import { useQuery } from "@tanstack/react-query";
import {
  getAdminThesisGroupsApi,
  AdminThesisGroup,
} from "@/resources/admin/api";
import { useEffect } from "react";
import { toast } from "sonner";

interface UseAdminThesisGroupsOptions {
  semesterId?: string;
  enabled?: boolean;
}

interface UseAdminThesisGroupsReturn {
  groups: AdminThesisGroup[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAdminThesisGroups(
  options: UseAdminThesisGroupsOptions = {},
): UseAdminThesisGroupsReturn {
  const { semesterId, enabled = true } = options;

  const query = useQuery<AdminThesisGroup[]>({
    queryKey: ["admin-documents-thesis-groups", semesterId],
    queryFn: () =>
      getAdminThesisGroupsApi({
        semesterId,
      }),
    enabled: enabled && !!semesterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
  });

  // Handle errors with useEffect
  useEffect(() => {
    if (query.isError && query.error) {
      console.error("Failed to fetch admin thesis groups:", query.error);
      toast.error("Failed to load thesis groups");
    }
  }, [query.isError, query.error]);

  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: query.refetch as any,
  };
}
