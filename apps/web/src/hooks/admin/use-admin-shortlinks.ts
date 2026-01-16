/**
 * useAdminShortlinks Hook
 *
 * tRPC hook for fetching and managing shortlinks.
 */

import { trpc } from '@/trpc/react';

interface Shortlink {
  id: string;
  slug: string;
  destinationUrl: string;
  title: string | null;
  description: string | null;
  isActive: boolean;
  password: string | null;
  expiresAt: Date | string | null;
  clickCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function useAdminShortlinks() {
  const { data, isLoading, isRefetching, error, refetch } =
    trpc.admin.getShortlinks.useQuery(undefined, {
      keepPreviousData: true,
    });

  return {
    shortlinks: data ?? [],
    isLoading,
    isValidating: isRefetching,
    error,
    mutate: refetch,
  };
}

export type { Shortlink };
