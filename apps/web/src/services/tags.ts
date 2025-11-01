import { db } from '@/db/client';
import { tags } from '@/db/schema';
import { eq, ilike } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { NotFoundError, ConflictError } from '@/lib/errors';
import type { Tag, CreateTagInput, UpdateTagInput } from '@/types/tag';
import { createTagInputSchema, updateTagInputSchema } from '@/types/tag';
import slugify from 'slugify';

function normalizeTag(dbTag: typeof tags.$inferSelect): Tag {
  return {
    id: dbTag.id,
    slug: dbTag.slug,
    label: dbTag.label,
    description: dbTag.description,
    createdAt: dbTag.createdAt.toISOString(),
    updatedAt: dbTag.updatedAt.toISOString(),
  };
}

export async function getAllTags(): Promise<Tag[]> {
  try {
    const result = await db.select().from(tags);
    return result.map(normalizeTag);
  } catch (error) {
    logger.error('Error getting all tags', { error });
    throw new Error('Failed to get tags');
  }
}

export async function getTagById(id: string): Promise<Tag> {
  try {
    const result = await db.select().from(tags).where(eq(tags.id, id)).limit(1);

    if (result.length === 0) {
      throw new NotFoundError(`Tag not found: ${id}`);
    }

    return normalizeTag(result[0]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error getting tag by ID', { error, id });
    throw new Error('Failed to get tag');
  }
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  try {
    const result = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    return result.length > 0 ? normalizeTag(result[0]) : null;
  } catch (error) {
    logger.error('Error getting tag by slug', { error, slug });
    throw new Error('Failed to get tag');
  }
}

export async function searchTags(query: string): Promise<Tag[]> {
  try {
    const result = await db
      .select()
      .from(tags)
      .where(ilike(tags.label, `%${query}%`));

    return result.map(normalizeTag);
  } catch (error) {
    logger.error('Error searching tags', { error, query });
    throw new Error('Failed to search tags');
  }
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const validated = createTagInputSchema.parse(input);

  try {
    // Generate slug if not provided or normalize it
    const slug = validated.slug
      ? slugify(validated.slug, { lower: true, strict: true })
      : slugify(validated.label, { lower: true, strict: true });

    // Check if slug already exists
    const existing = await getTagBySlug(slug);
    if (existing) {
      throw new ConflictError(`Tag with slug '${slug}' already exists`);
    }

    const result = await db
      .insert(tags)
      .values({
        slug,
        label: validated.label,
        description: validated.description || null,
      })
      .returning();

    logger.info('Tag created', { slug, label: validated.label });
    return normalizeTag(result[0]);
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    logger.error('Error creating tag', { error, input });
    throw new Error('Failed to create tag');
  }
}

export async function updateTag(
  id: string,
  input: UpdateTagInput
): Promise<Tag> {
  const validated = updateTagInputSchema.parse(input);

  try {
    // Check if tag exists
    await getTagById(id);

    // If slug is being updated, check for conflicts
    if (validated.slug) {
      const normalizedSlug = slugify(validated.slug, {
        lower: true,
        strict: true,
      });
      const existing = await getTagBySlug(normalizedSlug);
      if (existing && existing.id !== id) {
        throw new ConflictError(
          `Tag with slug '${normalizedSlug}' already exists`
        );
      }
      validated.slug = normalizedSlug;
    }

    const result = await db
      .update(tags)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(tags.id, id))
      .returning();

    logger.info('Tag updated', { id });
    return normalizeTag(result[0]);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      throw error;
    }
    logger.error('Error updating tag', { error, id, input });
    throw new Error('Failed to update tag');
  }
}

export async function deleteTag(id: string): Promise<void> {
  try {
    // Check if tag exists
    await getTagById(id);

    await db.delete(tags).where(eq(tags.id, id));
    logger.info('Tag deleted', { id });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error deleting tag', { error, id });
    throw new Error('Failed to delete tag');
  }
}
