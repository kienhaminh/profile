import { db } from '../db';
import { topics, type Topic, type NewTopic } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { CreateTopicRequest, UpdateTopicRequest } from '../lib/validation';

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
  } catch (error: any) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Topic with this name or slug already exists');
    }
    throw error;
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
  const existingTopic = await getTopic(id);
  if (!existingTopic) {
    throw new Error('Topic not found');
  }

  const updateData: Partial<NewTopic> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;

  try {
    const [updatedTopic] = await db
      .update(topics)
      .set(updateData)
      .where(eq(topics.id, id))
      .returning();
    return updatedTopic;
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('Topic with this name or slug already exists');
    }
    throw error;
  }
}

export async function deleteTopic(id: string): Promise<void> {
  const existingTopic = await getTopic(id);
  if (!existingTopic) {
    throw new Error('Topic not found');
  }

  await db.delete(topics).where(eq(topics.id, id));
}

// Legacy function for backward compatibility
export async function getAllTopics(): Promise<Topic[]> {
  return listTopics();
}
