import { db } from '../db';
import { topics, type Topic, type NewTopic } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { CreateTopicRequest, UpdateTopicRequest } from '../lib/validation';

export class TopicNotFoundError extends Error {
  constructor(message: string = 'Topic not found') {
    super(message);
    this.name = 'TopicNotFoundError';
  }
}

export class TopicConflictError extends Error {
  constructor(message: string = 'Topic with this name or slug already exists') {
    super(message);
    this.name = 'TopicConflictError';
  }
}

/**
 * Helper function to handle unique constraint errors
 * Checks for PostgreSQL duplicate key violations and throws a standardized error
 * @param error - The error to inspect
 * @throws {Error} - Standardized error for unique constraint violations
 * @throws - The original error if not a unique constraint violation
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
    // Unique constraint violation
    throw new TopicConflictError();
  }

  throw error;
}

/**
 * Topic service - Pure functions for topic management
 * All functions follow functional programming principles:
 * - Clear input/output
 * - No hidden state changes
 * - Explicit error handling
 */

export async function createTopic(data: CreateTopicRequest): Promise<Topic> {
  const newTopic: NewTopic = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
  };

  try {
    const [topic] = await db.insert(topics).values(newTopic).returning();
    return topic;
  } catch (error) {
    handleUniqueConstraintError(error);
  }
}

export async function listTopics(): Promise<Topic[]> {
  const allTopics = await db.select().from(topics).orderBy(topics.name);
  return allTopics;
}

export async function getTopic(id: string): Promise<Topic | null> {
  const [topic] = await db.select().from(topics).where(eq(topics.id, id));
  return topic || null;
}

export async function updateTopic(
  id: string,
  data: UpdateTopicRequest
): Promise<Topic> {
  const updateData: Partial<NewTopic> = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
  };

  const [updatedTopic] = await db
    .update(topics)
    .set(updateData)
    .where(eq(topics.id, id))
    .returning();

  if (!updatedTopic) {
    throw new TopicNotFoundError();
  }

  return updatedTopic;
}

export async function deleteTopic(id: string): Promise<void> {
  const result = await db.delete(topics).where(eq(topics.id, id)).returning();

  if (result.length === 0) {
    throw new TopicNotFoundError();
  }
}

// Legacy function for backward compatibility
export async function getAllTopics(): Promise<Topic[]> {
  return listTopics();
}
