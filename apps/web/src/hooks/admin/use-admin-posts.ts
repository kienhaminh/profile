/**
 * useAdminPosts Hook
 *
 * SWR hook for fetching and managing admin posts (blogs).
 */

import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/swr';
import type { Blog } from '@/types/blog';

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
  const params = new URLSearchParams();

  if (options.status && options.status !== 'all') {
    params.append('status', options.status);
  }
  if (options.search) {
    params.append('search', options.search);
  }
  if (options.page) {
    params.append('page', String(options.page));
  }
  if (options.limit) {
    params.append('limit', String(options.limit));
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.POSTS}?${queryString}`
    : API_ENDPOINTS.POSTS;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<PostsResponse>(url);

  return {
    posts: data?.items ?? [],
    pagination: data?.pagination,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
