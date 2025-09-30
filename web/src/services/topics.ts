import { db } from '@/db';
import { topics, postTopics } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export async function getAllTopics(): Promise<Topic[]> {
  const result = await db.select().from(topics).orderBy(asc(topics.name));

  return result;
}

export async function getTopicByName(name: string): Promise<Topic | null> {
  const result = await db
    .select()
    .from(topics)
    .where(eq(topics.name, name))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createTopic(
  name: string,
  description?: string
): Promise<Topic> {
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const [topic] = await db
    .insert(topics)
    .values({
      name,
      slug,
      description: description || null,
    })
    .returning();

  if (!topic) {
    throw new Error('Failed to create topic');
  }

  return topic;
}

export async function assignTopicsToPost(
  postId: string,
  topicNames: string[]
): Promise<void> {
  // First, remove existing topic assignments
  await db.delete(postTopics).where(eq(postTopics.postId, postId));

  // Then create new assignments
  for (const topicName of topicNames) {
    // Check if topic exists
    const existingTopic = await db
      .select()
      .from(topics)
      .where(eq(topics.name, topicName))
      .limit(1);

    let topicId: string;
    if (existingTopic.length > 0) {
      topicId = existingTopic[0].id;
    } else {
      // Create new topic
      const [newTopic] = await db
        .insert(topics)
        .values({
          name: topicName,
          slug: topicName.toLowerCase().replace(/\s+/g, '-'),
        })
        .returning();

      if (!newTopic) {
        throw new Error(`Failed to create topic: ${topicName}`);
      }
      topicId = newTopic.id;
    }

    await db.insert(postTopics).values({
      postId,
      topicId,
    });
  }
}
