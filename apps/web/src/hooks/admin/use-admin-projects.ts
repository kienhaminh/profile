/**
 * useAdminProjects Hook
 *
 * SWR hook for fetching and managing admin projects.
 */

import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/swr';
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

interface ProjectsResponse {
  items: Project[];
}

interface UseAdminProjectsOptions {
  status?: string;
  search?: string;
}

export function useAdminProjects(options: UseAdminProjectsOptions = {}) {
  const params = new URLSearchParams();

  if (options.status && options.status !== 'all') {
    params.append('status', options.status);
  }
  if (options.search) {
    params.append('search', options.search);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.PROJECTS}?${queryString}`
    : API_ENDPOINTS.PROJECTS;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ProjectsResponse>(url);

  return {
    projects: data?.items ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
