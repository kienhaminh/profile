/**
 * useAdminFavorites Hook
 *
 * SWR hook for fetching and managing favorites.
 */

import useSWR from 'swr';
import { API_ENDPOINTS } from '@/lib/swr';

interface FavoriteCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  createdAt: Date;
}

interface Tag {
  id: string;
  slug: string;
  label: string;
  description?: string | null;
}

interface FavoriteWithCategory {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  address?: string | null;
  rating?: number | null;
  notes?: string | null;
  url?: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: FavoriteCategory;
  tags?: Tag[];
}

interface FavoritesResponse {
  favorites: FavoriteWithCategory[];
  categories: FavoriteCategory[];
  tags: Tag[];
}

interface UseAdminFavoritesOptions {
  categoryId?: string;
}

export function useAdminFavorites(options: UseAdminFavoritesOptions = {}) {
  const params = new URLSearchParams();

  if (options.categoryId) {
    params.append('categoryId', options.categoryId);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.FAVORITES}?${queryString}`
    : API_ENDPOINTS.FAVORITES;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<FavoritesResponse>(url);

  return {
    favorites: data?.favorites ?? [],
    categories: data?.categories ?? [],
    tags: data?.tags ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

export type { FavoriteCategory, FavoriteWithCategory, Tag };
