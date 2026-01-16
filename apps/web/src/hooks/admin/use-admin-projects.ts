/**
 * useAdminProjects Hook
 *
 * tRPC hook for fetching and managing admin projects.
 */

import { trpc } from '@/trpc/react';
import type { ProjectStatus } from '@/types/enums';

interface Project {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  description: string;
  isOngoing: boolean;
  createdAt: string;
  tags: Array<{ id: string; label: string }>;
}

interface UseAdminProjectsOptions {
  status?: string;
  search?: string;
}

export function useAdminProjects(options: UseAdminProjectsOptions = {}) {
  const { data, isLoading, isRefetching, error, refetch } =
    trpc.admin.getProjects.useQuery(
      {
        status: options.status,
        search: options.search,
      },
      {
        keepPreviousData: true,
      }
    );

  return {
    projects: data?.items ?? [],
    isLoading,
    isValidating: isRefetching,
    error,
    mutate: refetch, // Alias refetch as mutate for compatibility
  };
}
