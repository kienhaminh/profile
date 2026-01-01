import { db } from '@/db/client';
import { blogSeries, posts } from '@/db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { NotFoundError, ConflictError } from '@/lib/errors';
import type {
  BlogSeries,
  CreateSeriesInput,
  UpdateSeriesInput,
  SeriesWithCount,
} from '@/types/series';
import {
  createSeriesInputSchema,
  updateSeriesInputSchema,
} from '@/types/series';
import type { Blog } from '@/types/blog';
import { POST_STATUS } from '@/types/enums';
import { getPostById } from './posts';

function normalizeSeries(dbSeries: typeof blogSeries.$inferSelect): BlogSeries {
  return {
    id: dbSeries.id,
    slug: dbSeries.slug,
    title: dbSeries.title,
    description: dbSeries.description,
    status: dbSeries.status as any,
    coverImage: dbSeries.coverImage,
    createdAt: dbSeries.createdAt.toISOString(),
    updatedAt: dbSeries.updatedAt.toISOString(),
  };
}

export async function getAllSeries(): Promise<SeriesWithCount[]> {
  try {
    const result = await db
      .select({
        series: blogSeries,
        postCount: count(posts.id),
      })
      .from(blogSeries)
      .leftJoin(posts, eq(posts.seriesId, blogSeries.id))
      .groupBy(blogSeries.id)
      .orderBy(desc(blogSeries.createdAt));

    return result.map((row) => ({
      ...normalizeSeries(row.series),
      postCount: Number(row.postCount),
    }));
  } catch (error) {
    logger.error('Error getting all series', { error });
    throw new Error('Failed to get series');
  }
}

export async function getSeriesById(id: string): Promise<BlogSeries> {
  try {
    const result = await db
      .select()
      .from(blogSeries)
      .where(eq(blogSeries.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError(`Series not found: ${id}`);
    }

    return normalizeSeries(result[0]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error getting series by ID', { error, id });
    throw new Error('Failed to get series');
  }
}

export async function getSeriesBySlug(
  slug: string,
  includeUnpublished = false
): Promise<BlogSeries & { posts: Blog[] }> {
  try {
    const result = await db
      .select()
      .from(blogSeries)
      .where(eq(blogSeries.slug, slug))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError(`Series not found: ${slug}`);
    }

    const series = normalizeSeries(result[0]);

    // Get all posts in this series
    let postsQuery = db
      .select()
      .from(posts)
      .where(eq(posts.seriesId, series.id))
      .$dynamic();

    if (!includeUnpublished) {
      postsQuery = postsQuery.where(eq(posts.status, POST_STATUS.PUBLISHED));
    }

    const seriesPosts = await postsQuery.orderBy(posts.seriesOrder);

    // Get full blog data for each post
    const fullPosts = await Promise.all(
      seriesPosts.map((post) => getPostById(post.id))
    );

    return {
      ...series,
      posts: fullPosts,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error getting series by slug', { error, slug });
    throw new Error('Failed to get series');
  }
}

export async function createSeries(
  input: CreateSeriesInput
): Promise<BlogSeries> {
  const validated = createSeriesInputSchema.parse(input);

  try {
    // Check if slug already exists
    const existing = await db
      .select()
      .from(blogSeries)
      .where(eq(blogSeries.slug, validated.slug))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError(
        `Series with slug '${validated.slug}' already exists`
      );
    }

    const result = await db
      .insert(blogSeries)
      .values({
        slug: validated.slug,
        title: validated.title,
        description: validated.description || null,
        status: validated.status || 'DRAFT',
        coverImage: validated.coverImage || null,
      })
      .returning();

    logger.info('Series created', { id: result[0].id, slug: result[0].slug });
    return normalizeSeries(result[0]);
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    logger.error('Error creating series', { error, input });
    throw new Error('Failed to create series');
  }
}

export async function updateSeries(
  id: string,
  input: UpdateSeriesInput
): Promise<BlogSeries> {
  const validated = updateSeriesInputSchema.parse(input);

  try {
    // Check if series exists
    await getSeriesById(id);

    // If slug is being updated, check for conflicts
    if (validated.slug) {
      const existing = await db
        .select()
        .from(blogSeries)
        .where(eq(blogSeries.slug, validated.slug))
        .limit(1);

      if (existing.length > 0 && existing[0].id !== id) {
        throw new ConflictError(
          `Series with slug '${validated.slug}' already exists`
        );
      }
    }

    const result = await db
      .update(blogSeries)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(blogSeries.id, id))
      .returning();

    logger.info('Series updated', { id });
    return normalizeSeries(result[0]);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      throw error;
    }
    logger.error('Error updating series', { error, id, input });
    throw new Error('Failed to update series');
  }
}

export async function deleteSeries(id: string): Promise<void> {
  try {
    // Check if series exists
    await getSeriesById(id);

    // Delete series (posts.series_id will be set to null due to onDelete: 'set null')
    await db.delete(blogSeries).where(eq(blogSeries.id, id));

    logger.info('Series deleted', { id });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error deleting series', { error, id });
    throw new Error('Failed to delete series');
  }
}

// Get the next suggested order number for a series
export async function getNextSeriesOrder(seriesId: string): Promise<number> {
  try {
    const result = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${posts.seriesOrder}), 0)` })
      .from(posts)
      .where(eq(posts.seriesId, seriesId));

    return (result[0]?.maxOrder || 0) + 1;
  } catch (error) {
    logger.error('Error getting next series order', { error, seriesId });
    return 1; // Default to 1 if error
  }
}
