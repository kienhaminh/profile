/**
 * useAdminStats Hook
 *
 * tRPC hook for fetching dashboard statistics.
 */

import { trpc } from '@/trpc/react';

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
  const { data, isLoading, isRefetching, error, refetch } =
    trpc.admin.getDashboardStats.useQuery(undefined, {
      keepPreviousData: true,
    });

  return {
    stats: (data as unknown as DashboardStats) ?? null, // Casting since return type should match
    isLoading,
    isValidating: isRefetching,
    error,
    mutate: refetch,
  };
}
