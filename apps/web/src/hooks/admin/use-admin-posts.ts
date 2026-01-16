/**
 * useAdminPosts Hook
 *
 * tRPC hook for fetching and managing admin posts (blogs).
 */

import { trpc } from '@/trpc/react';
import type { Blog } from '@/types/blog';
import { POST_STATUS } from '@/types/enums';

interface PostsResponse {
  items: Blog[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseAdminPostsOptions {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useAdminPosts(options: UseAdminPostsOptions = {}) {
  const { data, isLoading, isRefetching, error, refetch } =
    trpc.admin.getPosts.useQuery(
      {
        status: options.status as any, // Enum migration handling
        search: options.search,
        page: options.page,
        limit: options.limit,
      },
      {
        keepPreviousData: true,
      }
    );

  return {
    posts: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isValidating: isRefetching,
    error,
    mutate: refetch,
  };
}
