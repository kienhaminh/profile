/**
 * Favorites Server Actions
 *
 * CRUD operations for favorites feature. Provides functions for:
 * - Managing favorite categories (restaurants, movies, songs, etc.)
 * - Managing individual favorite items
 * - Managing tags for favorites
 */

'use server';

import { db } from '@/db/client';
import { favoriteCategories, favorites, favoriteTags, tags } from '@/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdminAuth } from '@/lib/server-auth';

// Types
export type FavoriteCategory = typeof favoriteCategories.$inferSelect;
export type NewFavoriteCategory = Omit<
  typeof favoriteCategories.$inferInsert,
  'id' | 'createdAt'
>;

export type Tag = typeof tags.$inferSelect;

export type Favorite = typeof favorites.$inferSelect;
export type FavoriteWithCategory = Favorite & {
  category: FavoriteCategory;
  tags?: Tag[];
};
export type NewFavorite = Omit<
  typeof favorites.$inferInsert,
  'id' | 'createdAt' | 'updatedAt'
>;

// ==================== CATEGORY ACTIONS ====================

// Get all favorite categories
export async function getFavoriteCategories(): Promise<FavoriteCategory[]> {
  return db
    .select()
    .from(favoriteCategories)
    .orderBy(desc(favoriteCategories.createdAt));
}

// Get a single category by ID
export async function getFavoriteCategory(
  id: string
): Promise<FavoriteCategory | null> {
  const result = await db
    .select()
    .from(favoriteCategories)
    .where(eq(favoriteCategories.id, id))
    .limit(1);
  return result[0] || null;
}

// Create a new category
export async function createFavoriteCategory(
  data: NewFavoriteCategory
): Promise<{ success: boolean; category?: FavoriteCategory; error?: string }> {
  await requireAdminAuth();
  try {
    const [newCategory] = await db
      .insert(favoriteCategories)
      .values(data)
      .returning();

    revalidatePath('/admin/favorites');
    return { success: true, category: newCategory };
  } catch (error) {
    console.error('Error creating favorite category:', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return { success: false, error: 'Category name already exists' };
    }
    return { success: false, error: 'Failed to create category' };
  }
}

// Update a category
export async function updateFavoriteCategory(
  id: string,
  data: Partial<NewFavoriteCategory>
): Promise<{ success: boolean; category?: FavoriteCategory; error?: string }> {
  await requireAdminAuth();
  try {
    const [updated] = await db
      .update(favoriteCategories)
      .set(data)
      .where(eq(favoriteCategories.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: 'Category not found' };
    }

    revalidatePath('/admin/favorites');
    return { success: true, category: updated };
  } catch (error) {
    console.error('Error updating favorite category:', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return { success: false, error: 'Category name already exists' };
    }
    return { success: false, error: 'Failed to update category' };
  }
}

// Delete a category (cascades to favorites)
export async function deleteFavoriteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();
  try {
    const result = await db
      .delete(favoriteCategories)
      .where(eq(favoriteCategories.id, id))
      .returning();

    if (result.length === 0) {
      return { success: false, error: 'Category not found' };
    }

    revalidatePath('/admin/favorites');
    return { success: true };
  } catch (error) {
    console.error('Error deleting favorite category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

// ==================== FAVORITE ITEM ACTIONS ====================

// Get all favorites with tags, optionally filtered by category
export async function getFavorites(
  categoryId?: string
): Promise<FavoriteWithCategory[]> {
  // First get the favorites with their categories
  const favoritesQuery = db
    .select({
      id: favorites.id,
      categoryId: favorites.categoryId,
      name: favorites.name,
      description: favorites.description,
      rating: favorites.rating,
      imageUrl: favorites.imageUrl,
      externalUrl: favorites.externalUrl,
      metadata: favorites.metadata,
      createdAt: favorites.createdAt,
      updatedAt: favorites.updatedAt,
      category: {
        id: favoriteCategories.id,
        name: favoriteCategories.name,
        icon: favoriteCategories.icon,
        color: favoriteCategories.color,
        createdAt: favoriteCategories.createdAt,
      },
    })
    .from(favorites)
    .innerJoin(
      favoriteCategories,
      eq(favorites.categoryId, favoriteCategories.id)
    )
    .orderBy(desc(favorites.createdAt));

  const favoritesList = categoryId
    ? await favoritesQuery.where(eq(favorites.categoryId, categoryId))
    : await favoritesQuery;

  if (favoritesList.length === 0) {
    return [];
  }

  // Get tags for all favorites
  const favoriteIds = favoritesList.map((f) => f.id);
  const favoriteTagsList = await db
    .select({
      favoriteId: favoriteTags.favoriteId,
      tag: {
        id: tags.id,
        slug: tags.slug,
        label: tags.label,
        description: tags.description,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
      },
    })
    .from(favoriteTags)
    .innerJoin(tags, eq(favoriteTags.tagId, tags.id))
    .where(inArray(favoriteTags.favoriteId, favoriteIds));

  // Group tags by favorite
  const tagsByFavorite = favoriteTagsList.reduce(
    (acc, { favoriteId, tag }) => {
      if (!acc[favoriteId]) {
        acc[favoriteId] = [];
      }
      acc[favoriteId].push(tag);
      return acc;
    },
    {} as Record<string, Tag[]>
  );

  // Combine favorites with their tags
  return favoritesList.map((favorite) => ({
    ...favorite,
    tags: tagsByFavorite[favorite.id] || [],
  }));
}

// Get a single favorite by ID with tags
export async function getFavorite(
  id: string
): Promise<(Favorite & { tags: Tag[] }) | null> {
  const [favorite] = await db
    .select()
    .from(favorites)
    .where(eq(favorites.id, id))
    .limit(1);

  if (!favorite) return null;

  // Get tags for this favorite
  const favoriteTagsData = await db
    .select({
      tag: {
        id: tags.id,
        slug: tags.slug,
        label: tags.label,
        description: tags.description,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
      },
    })
    .from(favoriteTags)
    .innerJoin(tags, eq(favoriteTags.tagId, tags.id))
    .where(eq(favoriteTags.favoriteId, id));

  return {
    ...favorite,
    tags: favoriteTagsData.map((ft) => ft.tag),
  };
}

// Create a new favorite with tags
export async function createFavorite(
  data: NewFavorite & { tagIds?: string[] }
): Promise<{ success: boolean; favorite?: Favorite; error?: string }> {
  await requireAdminAuth();
  try {
    const { tagIds, ...favoriteData } = data;
    const [newFavorite] = await db
      .insert(favorites)
      .values(favoriteData)
      .returning();

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await db.insert(favoriteTags).values(
        tagIds.map((tagId) => ({
          favoriteId: newFavorite.id,
          tagId,
        }))
      );
    }

    revalidatePath('/admin/favorites');
    return { success: true, favorite: newFavorite };
  } catch (error) {
    console.error('Error creating favorite:', error);
    return { success: false, error: 'Failed to create favorite' };
  }
}

// Update a favorite and its tags
export async function updateFavorite(
  id: string,
  data: Partial<NewFavorite> & { tagIds?: string[] }
): Promise<{ success: boolean; favorite?: Favorite; error?: string }> {
  await requireAdminAuth();
  try {
    const { tagIds, ...favoriteData } = data;
    const [updated] = await db
      .update(favorites)
      .set({
        ...favoriteData,
        updatedAt: new Date(),
      })
      .where(eq(favorites.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: 'Favorite not found' };
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      // Delete existing tags
      await db.delete(favoriteTags).where(eq(favoriteTags.favoriteId, id));

      // Add new tags
      if (tagIds.length > 0) {
        await db.insert(favoriteTags).values(
          tagIds.map((tagId) => ({
            favoriteId: id,
            tagId,
          }))
        );
      }
    }

    revalidatePath('/admin/favorites');
    return { success: true, favorite: updated };
  } catch (error) {
    console.error('Error updating favorite:', error);
    return { success: false, error: 'Failed to update favorite' };
  }
}

// Delete a favorite
export async function deleteFavorite(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();
  try {
    const result = await db
      .delete(favorites)
      .where(eq(favorites.id, id))
      .returning();

    if (result.length === 0) {
      return { success: false, error: 'Favorite not found' };
    }

    revalidatePath('/admin/favorites');
    return { success: true };
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return { success: false, error: 'Failed to delete favorite' };
  }
}

// ==================== TAG ACTIONS ====================

// Get all tags
export async function getAllTags(): Promise<Tag[]> {
  return db.select().from(tags).orderBy(tags.label);
}

// Create a new tag
export async function createTag(data: {
  slug: string;
  label: string;
  description?: string;
}): Promise<{ success: boolean; tag?: Tag; error?: string }> {
  await requireAdminAuth();
  try {
    const [newTag] = await db.insert(tags).values(data).returning();
    revalidatePath('/admin/favorites');
    return { success: true, tag: newTag };
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return { success: false, error: 'Tag slug already exists' };
    }
    return { success: false, error: 'Failed to create tag' };
  }
}
