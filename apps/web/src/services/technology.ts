import { db } from '../db';
import {
  technologies,
  type Technology,
  type NewTechnology,
} from '../db/schema';
import { eq } from 'drizzle-orm';
import type {
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
} from '../lib/validation';

/**
 * Technology service - Pure functions for technology management
 * All functions follow functional programming principles:
 * - Clear input/output
 * - No hidden state changes
 * - Explicit error handling
 */

export async function createTechnology(
  data: CreateTechnologyRequest
): Promise<Technology> {
  const newTechnology: NewTechnology = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
  };

  try {
    const [technology] = await db
      .insert(technologies)
      .values(newTechnology)
      .returning();
    return technology;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : '';
    if (
      errorCode === '23505' ||
      String(errorMessage || '').includes('duplicate key value') ||
      String(errorMessage || '').includes('unique constraint')
    ) {
      // Unique constraint violation
      throw new Error('Technology with this name or slug already exists');
    }
    throw error;
  }
}

export async function listTechnologies(): Promise<Technology[]> {
  const allTechnologies = await db
    .select()
    .from(technologies)
    .orderBy(technologies.name);
  return allTechnologies;
}

export async function getTechnology(id: string): Promise<Technology | null> {
  const [technology] = await db
    .select()
    .from(technologies)
    .where(eq(technologies.id, id));
  return technology || null;
}

export async function updateTechnology(
  id: string,
  data: UpdateTechnologyRequest
): Promise<Technology> {
  const existingTechnology = await getTechnology(id);
  if (!existingTechnology) {
    throw new Error('Technology not found');
  }

  const updateData: Partial<NewTechnology> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;

  try {
    const [updatedTechnology] = await db
      .update(technologies)
      .set(updateData)
      .where(eq(technologies.id, id))
      .returning();
    return updatedTechnology;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : '';
    if (
      errorCode === '23505' ||
      String(errorMessage || '').includes('duplicate key value') ||
      String(errorMessage || '').includes('unique constraint')
    ) {
      throw new Error('Technology with this name or slug already exists');
    }
    throw error;
  }
}

export async function deleteTechnology(id: string): Promise<void> {
  const existingTechnology = await getTechnology(id);
  if (!existingTechnology) {
    throw new Error('Technology not found');
  }

  await db.delete(technologies).where(eq(technologies.id, id));
}
