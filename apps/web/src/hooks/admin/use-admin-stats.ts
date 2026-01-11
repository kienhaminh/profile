/**
 * useAdminStats Hook
 *
 * SWR hook for fetching dashboard statistics.
 */

import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/swr';

interface DashboardStats {
  postsOverTime: Array<{ month: string; count: string; status: string }>;
  topicsDistribution: Array<{ name: string; post_count: string }>;
  hashtagsDistribution: Array<{
    name: string;
    post_count: string;
    project_count: string;
  }>;
  projectsStats: Array<{ status: string; count: string }>;
  recentActivity: {
    posts_this_week: string;
    projects_this_week: string;
    total_posts: string;
    total_projects: string;
    total_topics: string;
    total_hashtags: string;
  };
}

export function useAdminStats() {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<DashboardStats>(API_ENDPOINTS.STATS);

  return {
    stats: data ?? null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
