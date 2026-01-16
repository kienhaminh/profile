/**
 * useAdminAnalytics Hook
 *
 * tRPC hook for fetching analytics statistics.
 */

import { trpc } from '@/trpc/react';

interface AnalyticsStats {
  overview: {
    totalVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  today: {
    visitors: number;
    sessions: number;
    pageViews: number;
    views?: number;
  };
  thisWeek: {
    visitors: number;
    sessions: number;
    pageViews: number;
  };
  popularPages: Array<{
    pagePath: string;
    pageTitle: string | null;
    views: number;
    avgDuration: number;
  }>;
  visitorsOverTime: Array<{
    date: string;
    visitors: number;
    sessions: number;
    pageViews: number;
  }>;
  activity: Array<{
    label: string;
    value: number;
  }>;
  deviceDistribution: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  topSources: Array<{
    source: string;
    visitors: number;
  }>;
  topCountries: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
  activeVisitors: number;
}

type TimeRange = '24h' | '7d' | '30d';

export function useAdminAnalytics(range: TimeRange = '24h') {
  const { data, isLoading, isRefetching, error, refetch } =
    trpc.admin.getAnalytics.useQuery(
      {
        range,
      },
      {
        keepPreviousData: true,
      }
    );

  return {
    stats: (data as unknown as AnalyticsStats) ?? null,
    isLoading,
    isValidating: isRefetching,
    error,
    mutate: refetch,
  };
}
