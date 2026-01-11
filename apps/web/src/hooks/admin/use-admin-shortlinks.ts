/**
 * useAdminShortlinks Hook
 *
 * SWR hook for fetching and managing shortlinks.
 */

import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/swr';

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

interface ShortlinksResponse {
  shortlinks: Shortlink[];
}

export function useAdminShortlinks() {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ShortlinksResponse>(API_ENDPOINTS.SHORTLINKS);

  return {
    shortlinks: data?.shortlinks ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export type { Shortlink };
