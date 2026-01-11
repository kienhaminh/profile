/**
 * SWR Configuration
 *
 * Custom fetcher and default options for SWR data fetching.
 * Uses authFetch for authenticated admin API requests.
 */

import { authFetch } from './auth';

/**
 * Default fetcher for SWR using authFetch for authentication
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await authFetch(url);

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }

  return response.json();
};

/**
 * SWR default configuration options
 */
export const swrConfig = {
  fetcher,
  revalidateOnFocus: false, // Don't refetch when window regains focus
  revalidateOnReconnect: true, // Refetch when network reconnects
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  errorRetryCount: 3, // Retry failed requests 3 times
  shouldRetryOnError: true,
};

/**
 * API endpoints for admin
 */
export const API_ENDPOINTS = {
  POSTS: '/api/admin/posts',
  STATS: '/api/admin/stats',
  PROJECTS: '/api/projects',
  FAVORITES: '/api/admin/favorites',
  FAVORITE_CATEGORIES: '/api/admin/favorites/categories',
  ANALYTICS: '/api/admin/analytics',
  SHORTLINKS: '/api/admin/shortlinks',
  FLASHCARDS: '/api/admin/flashcards',
  VOCABULARIES: '/api/admin/vocabularies',
} as const;
