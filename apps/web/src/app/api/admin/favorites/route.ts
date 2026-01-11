/**
 * Admin Favorites API Route
 *
 * GET /api/admin/favorites - Get all favorites with categories and tags
 * POST /api/admin/favorites - Create a new favorite
 *
 * Replaces server actions for client-side fetching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractAdminTokenFromHeaders, verifyAdminToken } from '@/lib/auth';
import { db } from '@/db/client';
import { favoriteCategories, favorites, favoriteTags, tags } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const token = extractAdminTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verifyAdminToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get optional category filter
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    // Get all categories
    const categories = await db
      .select()
      .from(favoriteCategories)
      .orderBy(desc(favoriteCategories.createdAt));

    // Get favorites with optional category filter
    let favoritesQuery = db
      .select()
      .from(favorites)
      .orderBy(desc(favorites.createdAt));

    const favoritesData = categoryId
      ? await db
          .select()
          .from(favorites)
          .where(eq(favorites.categoryId, categoryId))
          .orderBy(desc(favorites.createdAt))
      : await favoritesQuery;

    // Get tags for each favorite
    const favoriteIds = favoritesData.map((f) => f.id);
    const favoriteTagsData =
      favoriteIds.length > 0
        ? await db
            .select({
              favoriteId: favoriteTags.favoriteId,
              tagId: favoriteTags.tagId,
            })
            .from(favoriteTags)
            .where(inArray(favoriteTags.favoriteId, favoriteIds))
        : [];

    // Get all tags
    const allTags = await db.select().from(tags);
    const tagsMap = new Map(allTags.map((t) => [t.id, t]));

    // Build favorites with category and tags
    const categoriesMap = new Map(categories.map((c) => [c.id, c]));

    const favoritesWithData = favoritesData.map((favorite) => {
      const category = categoriesMap.get(favorite.categoryId);
      const favTagIds = favoriteTagsData
        .filter((ft) => ft.favoriteId === favorite.id)
        .map((ft) => ft.tagId);
      const favTags = favTagIds
        .map((tagId) => tagsMap.get(tagId))
        .filter(Boolean);

      return {
        ...favorite,
        category: category!,
        tags: favTags,
      };
    });

    return NextResponse.json({
      favorites: favoritesWithData,
      categories,
      tags: allTags,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const token = extractAdminTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verifyAdminToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      imageUrl,
      rating,
      externalUrl,
      categoryId,
      tagIds,
      metadata,
    } = body;

    // Create favorite
    const [newFavorite] = await db
      .insert(favorites)
      .values({
        name,
        description,
        imageUrl,
        rating,
        externalUrl,
        categoryId,
        metadata,
      })
      .returning();

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await db.insert(favoriteTags).values(
        tagIds.map((tagId: string) => ({
          favoriteId: newFavorite.id,
          tagId,
        }))
      );
    }

    return NextResponse.json({ success: true, favorite: newFavorite });
  } catch (error) {
    console.error('Error creating favorite:', error);
    return NextResponse.json(
      { error: 'Failed to create favorite' },
      { status: 500 }
    );
  }
}
