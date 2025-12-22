/**
 * Shortlinks Server Actions
 *
 * CRUD operations for URL shortener feature. Provides functions for:
 * - Listing, creating, updating, and deleting shortlinks
 * - Resolving slugs for public redirects
 * - Click tracking and slug generation
 */

'use server';

import { db } from '@/db/client';
import { shortlinks } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { requireAdminAuth } from '@/lib/server-auth';

// Types
export type Shortlink = typeof shortlinks.$inferSelect;
export type NewShortlink = Omit<
  typeof shortlinks.$inferInsert,
  'id' | 'createdAt' | 'updatedAt' | 'clickCount'
>;

// Generate a random 6-character slug
export async function generateSlug(): Promise<string> {
  return nanoid(6);
}

// Get all shortlinks
export async function getShortlinks(): Promise<Shortlink[]> {
  return db.select().from(shortlinks).orderBy(desc(shortlinks.createdAt));
}

// Get a single shortlink by ID
export async function getShortlink(id: string): Promise<Shortlink | null> {
  const result = await db
    .select()
    .from(shortlinks)
    .where(eq(shortlinks.id, id))
    .limit(1);
  return result[0] || null;
}

// Create a new shortlink
export async function createShortlink(
  data: NewShortlink
): Promise<{ success: boolean; shortlink?: Shortlink; error?: string }> {
  await requireAdminAuth();
  try {
    // Generate slug if not provided
    const slug = data.slug || (await generateSlug());

    // Check if slug already exists
    const existing = await db
      .select()
      .from(shortlinks)
      .where(eq(shortlinks.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'Slug already exists' };
    }

    const [newShortlink] = await db
      .insert(shortlinks)
      .values({
        ...data,
        slug,
        clickCount: 0,
      })
      .returning();

    revalidatePath('/admin/shortlinks');
    return { success: true, shortlink: newShortlink };
  } catch (error) {
    console.error('Error creating shortlink:', error);
    return { success: false, error: 'Failed to create shortlink' };
  }
}

// Update a shortlink
export async function updateShortlink(
  id: string,
  data: Partial<NewShortlink>
): Promise<{ success: boolean; shortlink?: Shortlink; error?: string }> {
  await requireAdminAuth();
  try {
    // If updating slug, check for conflicts
    if (data.slug) {
      const existing = await db
        .select()
        .from(shortlinks)
        .where(eq(shortlinks.slug, data.slug))
        .limit(1);

      if (existing.length > 0 && existing[0].id !== id) {
        return { success: false, error: 'Slug already exists' };
      }
    }

    const [updated] = await db
      .update(shortlinks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(shortlinks.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: 'Shortlink not found' };
    }

    revalidatePath('/admin/shortlinks');
    return { success: true, shortlink: updated };
  } catch (error) {
    console.error('Error updating shortlink:', error);
    return { success: false, error: 'Failed to update shortlink' };
  }
}

// Delete a shortlink
export async function deleteShortlink(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();
  try {
    const result = await db
      .delete(shortlinks)
      .where(eq(shortlinks.id, id))
      .returning();

    if (result.length === 0) {
      return { success: false, error: 'Shortlink not found' };
    }

    revalidatePath('/admin/shortlinks');
    return { success: true };
  } catch (error) {
    console.error('Error deleting shortlink:', error);
    return { success: false, error: 'Failed to delete shortlink' };
  }
}

// Resolve a shortlink by slug (for public redirect)
export async function resolveShortlink(slug: string): Promise<{
  success: boolean;
  destinationUrl?: string;
  error?: string;
  requiresPassword?: boolean;
}> {
  try {
    const [link] = await db
      .select()
      .from(shortlinks)
      .where(eq(shortlinks.slug, slug))
      .limit(1);

    if (!link) {
      return { success: false, error: 'Shortlink not found' };
    }

    if (!link.isActive) {
      return { success: false, error: 'Shortlink is inactive' };
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return { success: false, error: 'Shortlink has expired' };
    }

    if (link.password) {
      return { success: true, requiresPassword: true };
    }

    return { success: true, destinationUrl: link.destinationUrl };
  } catch (error) {
    console.error('Error resolving shortlink:', error);
    return { success: false, error: 'Failed to resolve shortlink' };
  }
}

// Increment click count
export async function incrementClickCount(slug: string): Promise<void> {
  try {
    await db
      .update(shortlinks)
      .set({
        clickCount: sql`${shortlinks.clickCount} + 1`,
      })
      .where(eq(shortlinks.slug, slug));
  } catch (error) {
    console.error('Error incrementing click count:', error);
  }
}

// Toggle shortlink active status
export async function toggleShortlinkStatus(
  id: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  await requireAdminAuth();
  try {
    const [link] = await db
      .select()
      .from(shortlinks)
      .where(eq(shortlinks.id, id))
      .limit(1);

    if (!link) {
      return { success: false, error: 'Shortlink not found' };
    }

    const [updated] = await db
      .update(shortlinks)
      .set({
        isActive: !link.isActive,
        updatedAt: new Date(),
      })
      .where(eq(shortlinks.id, id))
      .returning();

    revalidatePath('/admin/shortlinks');
    return { success: true, isActive: updated.isActive };
  } catch (error) {
    console.error('Error toggling shortlink status:', error);
    return { success: false, error: 'Failed to toggle status' };
  }
}
