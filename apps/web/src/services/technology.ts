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
import {
  NotFoundError,
  ConflictError,
  TechnologyNotFoundError,
  TechnologyConflictError,
} from '../lib/error-utils';

/**
 * Technology service - Pure functions for technology management
 * All functions follow functional programming principles:
 * - Clear input/output
 * - No hidden state changes
 * - Explicit error handling
 */

/**
 * Helper function to handle unique constraint errors
 * Throws a normalized error for duplicate key violations or rethrows the original error
 */
function handleUniqueConstraintError(error: unknown): never {
  const errorMessage = error instanceof Error ? error.message : '';
  const errorCode =
    error && typeof error === 'object' && 'code' in error ? error.code : '';

  if (
    errorCode === '23505' ||
    String(errorMessage || '').includes('duplicate key value') ||
    String(errorMessage || '').includes('unique constraint')
  ) {
    throw new TechnologyConflictError(
      'Technology with this name or slug already exists'
    );
  }

  throw error;
}

/**
 * Helper function to handle foreign key constraint errors during deletion
 * Throws a normalized error for referential integrity violations or rethrows the original error
 */
function handleForeignKeyConstraintError(error: unknown): never {
  const errorMessage = error instanceof Error ? error.message : '';
  const errorCode =
    error && typeof error === 'object' && 'code' in error ? error.code : '';

  if (
    errorCode === '23503' ||
    String(errorMessage || '').includes('foreign key') ||
    String(errorMessage || '').includes('violates foreign key constraint')
  ) {
    throw new TechnologyConflictError(
      'Cannot delete technology as it is being used by existing projects'
    );
  }

  throw error;
}

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
    handleUniqueConstraintError(error);
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
  const updateData: Partial<NewTechnology> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;

  try {
    const result = await db
      .update(technologies)
      .set(updateData)
      .where(eq(technologies.id, id))
      .returning();

    if (result.length === 0) {
      throw new TechnologyNotFoundError('Technology not found');
    }

    return result[0];
  } catch (error) {
    handleUniqueConstraintError(error);
  }
}

export async function deleteTechnology(id: string): Promise<void> {
  const existingTechnology = await getTechnology(id);
  if (!existingTechnology) {
    throw new TechnologyNotFoundError('Technology not found');
  }

  try {
    await db.delete(technologies).where(eq(technologies.id, id));
  } catch (error) {
    handleForeignKeyConstraintError(error);
  }
}
