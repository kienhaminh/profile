/**
 * useAdminFavorites Hook
 *
 * tRPC hook for fetching and managing favorites.
 */

import { trpc } from '@/trpc/react';

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

interface UseAdminFavoritesOptions {
  categoryId?: string;
}

export function useAdminFavorites(options: UseAdminFavoritesOptions = {}) {
  const { data, isLoading, isRefetching, error, refetch } =
    trpc.admin.getFavorites.useQuery(
      {
        categoryId: options.categoryId,
      },
      {
        keepPreviousData: true,
      }
    );

  return {
    favorites: data?.favorites ?? [],
    categories: data?.categories ?? [],
    tags: data?.tags ?? [],
    isLoading,
    isValidating: isRefetching,
    error,
    mutate: refetch,
  };
}

export type { FavoriteCategory, FavoriteWithCategory, Tag };
