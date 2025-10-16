import { db } from '../db';
import { hashtags, type Hashtag, type NewHashtag } from '../db/schema';
import { eq } from 'drizzle-orm';
import type {
  CreateHashtagRequest,
  UpdateHashtagRequest,
} from '../lib/validation';

/**
 * Hashtag service - Pure functions for hashtag management
 * All functions follow functional programming principles:
 * - Clear input/output
 * - No hidden state changes
 * - Explicit error handling
 */

export async function createHashtag(
  data: CreateHashtagRequest
): Promise<Hashtag> {
  const newHashtag: NewHashtag = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
  };

  try {
    const [hashtag] = await db.insert(hashtags).values(newHashtag).returning();
    return hashtag;
  } catch (error: any) {
    if (
      error.code === '23505' ||
      String(error.message || '').includes('duplicate key value') ||
      String(error.message || '').includes('unique constraint')
    ) {
      // Unique constraint violation
      throw new Error('Hashtag with this name or slug already exists');
    }
    throw error;
  }
}

export async function listHashtags(): Promise<Hashtag[]> {
  try {
    console.log('[hashtag.ts] Fetching hashtags from database...');
    const allHashtags = await db.select().from(hashtags).orderBy(hashtags.name);
    console.log(
      '[hashtag.ts] Successfully fetched hashtags:',
      allHashtags.length
    );
    return allHashtags;
  } catch (error: any) {
    console.error('[hashtag.ts] Error fetching hashtags:', error);
    console.error('[hashtag.ts] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getHashtag(id: string): Promise<Hashtag | null> {
  const [hashtag] = await db.select().from(hashtags).where(eq(hashtags.id, id));
  return hashtag || null;
}

export async function updateHashtag(
  id: string,
  data: UpdateHashtagRequest
): Promise<Hashtag> {
  const existingHashtag = await getHashtag(id);
  if (!existingHashtag) {
    throw new Error('Hashtag not found');
  }

  const updateData: Partial<NewHashtag> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;

  try {
    const [updatedHashtag] = await db
      .update(hashtags)
      .set(updateData)
      .where(eq(hashtags.id, id))
      .returning();
    return updatedHashtag;
  } catch (error: any) {
    if (
      error.code === '23505' ||
      String(error.message || '').includes('duplicate key value') ||
      String(error.message || '').includes('unique constraint')
    ) {
      throw new Error('Hashtag with this name or slug already exists');
    }
    throw error;
  }
}

export async function deleteHashtag(id: string): Promise<void> {
  const existingHashtag = await getHashtag(id);
  if (!existingHashtag) {
    throw new Error('Hashtag not found');
  }

  await db.delete(hashtags).where(eq(hashtags.id, id));
}
