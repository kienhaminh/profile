import { db } from '@/db';
import { posts, topics, postTopics, Topic } from '@/db/schema';
import { eq, desc, inArray, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { generateUniqueSlug } from '@/lib/slug';
import {
  type PostStatus,
  POST_STATUS,
  POST_STATUS_VALUES,
} from '@/types/enums';

type DrizzleTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type { PostStatus };
export { POST_STATUS, POST_STATUS_VALUES };

/**
 * Helper function to build topics map from post-topic relations
 * @param postTopicRelations Array of post-topic relation objects
 * @returns Map keyed by postId with arrays of topic objects
 */
function buildTopicsMap(
  postTopicRelations: Array<{
    postId: string;
    topicId: string;
    topicName: string;
    topicSlug: string;
    topicDescription: string | null;
  }>
): Map<string, Topic[]> {
  const topicsMap = new Map<string, Topic[]>();

  for (const relation of postTopicRelations) {
    if (!topicsMap.has(relation.postId)) {
      topicsMap.set(relation.postId, []);
    }
    topicsMap.get(relation.postId)!.push({
      id: relation.topicId,
      name: relation.topicName,
      slug: relation.topicSlug,
      description: relation.topicDescription,
    });
  }

  return topicsMap;
}

/**
 * Helper function to batch process topics - handles existing topic lookup and creation of missing topics
 * @param tx Database transaction
 * @param topicNames Array of topic names to process
 * @returns Array of topic IDs in the same order as topicNames
 */
async function processTopicsBatch(
  tx: DrizzleTransaction,
  topicNames: string[]
): Promise<string[]> {
  if (topicNames.length === 0) {
    return [];
  }

  // Batch query all topics at once
  const existingTopics = await tx
    .select()
    .from(topics)
    .where(inArray(topics.name, topicNames));

  // Create a map for quick lookup of existing topics
  const existingTopicsMap = new Map<string, string>();
  existingTopics.forEach((topic: Topic) => {
    existingTopicsMap.set(topic.name, topic.id);
  });

  // Find missing topics
  const missingTopics = topicNames.filter(
    (name) => !existingTopicsMap.has(name)
  );

  // Get existing slugs to avoid collisions when creating new topics
  const existingSlugs = existingTopics.map((topic) => topic.slug);

  // Batch insert missing topics with proper slug generation
  if (missingTopics.length > 0) {
    const topicsWithSlugs = await Promise.all(
      missingTopics.map(async (name) => ({
        name,
        slug: await generateUniqueSlug(name, existingSlugs),
      }))
    );

    await tx.insert(topics).values(topicsWithSlugs);

    // Update existingSlugs with the newly created slugs
    existingSlugs.push(...topicsWithSlugs.map((t) => t.slug));
  }

  // Get all topic IDs (both existing and newly created)
  const allTopics = await tx
    .select()
    .from(topics)
    .where(inArray(topics.name, topicNames));

  // Return topic IDs in the same order as topicNames
  const topicIdMap = new Map<string, string>();
  allTopics.forEach((topic: Topic) => {
    topicIdMap.set(topic.name, topic.id);
  });

  return topicNames.map((name) => {
    const id = topicIdMap.get(name);
    if (!id) {
      throw new Error(`Failed to find or create topic: ${name}`);
    }
    return id;
  });
}

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  publishDate?: Date;
  coverImage?: string;
  topics: string[];
  authorId: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: PostStatus;
  publishDate?: Date;
  coverImage?: string;
  topics?: string[];
}

export interface PostWithTopics {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  publishDate: Date | null;
  content: string;
  excerpt: string | null;
  readTime: number | null;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  topics: Topic[];
}

export async function createPost(
  data: CreatePostData
): Promise<PostWithTopics> {
  const { topics: topicNames, ...postData } = data;

  return await db.transaction(async (tx) => {
    // Create the post
    const [newPost] = await tx
      .insert(posts)
      .values({
        ...postData,
        status: postData.status,
      })
      .returning();

    if (!newPost) {
      throw new Error('Failed to create post');
    }

    // Process topics and get topic IDs
    const topicIds = await processTopicsBatch(tx, topicNames);

    // Batch insert all post-topic relationships
    if (topicIds.length > 0) {
      await tx.insert(postTopics).values(
        topicIds.map((topicId) => ({
          postId: newPost.id,
          topicId,
        }))
      );
    }

    // Get the topics that were just inserted/associated using the transaction
    const postTopicRelations = await tx
      .select({
        topicId: postTopics.topicId,
        topicName: topics.name,
        topicSlug: topics.slug,
        topicDescription: topics.description,
      })
      .from(postTopics)
      .innerJoin(topics, eq(postTopics.topicId, topics.id))
      .where(eq(postTopics.postId, newPost.id));

    // Assemble the complete PostWithTopics response using transaction data
    const createdPost: PostWithTopics = {
      ...newPost,
      topics: postTopicRelations.map((pt) => ({
        id: pt.topicId,
        name: pt.topicName,
        slug: pt.topicSlug,
        description: pt.topicDescription,
      })),
    };

    return createdPost;
  });
}

export async function getPostBySlug(
  slug: string
): Promise<PostWithTopics | null> {
  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (post.length === 0) {
    return null;
  }

  // Get associated topics
  const postTopicRelations = await db
    .select({
      topicId: postTopics.topicId,
      topicName: topics.name,
      topicSlug: topics.slug,
      topicDescription: topics.description,
    })
    .from(postTopics)
    .innerJoin(topics, eq(postTopics.topicId, topics.id))
    .where(eq(postTopics.postId, post[0].id));

  return {
    ...post[0],
    topics: postTopicRelations.map((pt) => ({
      id: pt.topicId,
      name: pt.topicName,
      slug: pt.topicSlug,
      description: pt.topicDescription,
    })),
  } as PostWithTopics;
}

export async function getPosts(filters?: {
  status?: PostStatus;
  topic?: string;
  limit?: number;
  offset?: number;
}): Promise<PostWithTopics[]> {
  try {
    logger.info('getPosts called with filters', filters);
  } catch {
    // Ignore logger errors
  }

  // If filtering by topic, fetch topic ID first and return early if not found
  if (filters?.topic) {
    const topicResult = await db
      .select()
      .from(topics)
      .where(eq(topics.name, filters.topic))
      .limit(1);

    if (topicResult.length === 0) {
      return [];
    }

    const topicId = topicResult[0].id;

    // Get posts that have the specified topic
    const whereConditions = [eq(postTopics.topicId, topicId)];

    // Apply status filter if provided
    if (filters.status) {
      whereConditions.push(eq(posts.status, filters.status));
    }

    // First get the posts that match our filters
    const filteredPosts = await db
      .select()
      .from(posts)
      .innerJoin(postTopics, eq(posts.id, postTopics.postId))
      .where(and(...whereConditions))
      .orderBy(desc(posts.publishDate))
      .limit(filters.limit || 10)
      .offset(filters.offset || 0);

    if (filteredPosts.length === 0) {
      return [];
    }

    // Extract unique post IDs
    const postIds = [...new Set(filteredPosts.map((fp) => fp.posts.id))];

    // Get all topic relationships for these posts in a single query
    const postTopicRelations = await db
      .select({
        postId: postTopics.postId,
        topicId: postTopics.topicId,
        topicName: topics.name,
        topicSlug: topics.slug,
        topicDescription: topics.description,
      })
      .from(postTopics)
      .innerJoin(topics, eq(postTopics.topicId, topics.id))
      .where(inArray(postTopics.postId, postIds));

    // Build topics map from post-topic relations
    const topicsMap = buildTopicsMap(postTopicRelations);

    // Use the existing post data from filteredPosts (no need for redundant DB query)
    const fullPosts = filteredPosts.map((fp) => fp.posts);

    // Build result with topics attached
    const result: PostWithTopics[] = [];
    for (const post of fullPosts) {
      const postTopics = topicsMap.get(post.id) || [];
      result.push({
        ...post,
        topics: postTopics,
      } as PostWithTopics);
    }

    return result;
  }

  // No topic filtering - get all posts and their topics efficiently
  let query = db.select().from(posts);

  // Apply status filter
  if (filters?.status) {
    query = query.where(eq(posts.status, filters.status)) as typeof query;
  }

  // Apply ordering, limit, and offset
  const postsResult = await query
    .orderBy(desc(posts.publishDate))
    .limit(filters?.limit || 10)
    .offset(filters?.offset || 0);

  // If no posts found, return empty array early
  if (postsResult.length === 0) {
    return [];
  }

  // Get all topics for the filtered posts to avoid N+1 queries
  const postIds = postsResult.map((p) => p.id);
  const postTopicRelations = await db
    .select({
      postId: postTopics.postId,
      topicId: postTopics.topicId,
      topicName: topics.name,
      topicSlug: topics.slug,
      topicDescription: topics.description,
    })
    .from(postTopics)
    .innerJoin(topics, eq(postTopics.topicId, topics.id))
    .where(inArray(postTopics.postId, postIds));

  // Build topics map from post-topic relations
  const topicsMap = buildTopicsMap(postTopicRelations);

  // Build the result by attaching topics to each post
  const result: PostWithTopics[] = [];
  for (const post of postsResult) {
    const postTopics = topicsMap.get(post.id) || [];
    result.push({
      ...post,
      topics: postTopics,
    } as PostWithTopics);
  }

  return result;
}

export async function updatePost(
  slug: string,
  data: UpdatePostData
): Promise<PostWithTopics | null> {
  const { topics: topicNames, ...updateData } = data;

  return await db.transaction(async (tx) => {
    // Get the post
    const existingPost = await tx
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    if (existingPost.length === 0) {
      return null;
    }

    const postId = existingPost[0].id;

    // Update the post
    const [updatedPost] = await tx
      .update(posts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(posts.slug, slug))
      .returning();

    if (!updatedPost) {
      throw new Error('Failed to update post');
    }

    // Handle topics if provided
    if (topicNames) {
      // Delete all existing post-topic relationships
      await tx.delete(postTopics).where(eq(postTopics.postId, postId));

      // Process topics and get topic IDs
      const topicIds = await processTopicsBatch(tx, topicNames);

      // Batch insert all post-topic relationships
      if (topicIds.length > 0) {
        await tx.insert(postTopics).values(
          topicIds.map((topicId) => ({
            postId,
            topicId,
          }))
        );
      }
    }

    // Get the topics that were just inserted/associated using the transaction
    const postTopicRelations = await tx
      .select({
        topicId: postTopics.topicId,
        topicName: topics.name,
        topicSlug: topics.slug,
        topicDescription: topics.description,
      })
      .from(postTopics)
      .innerJoin(topics, eq(postTopics.topicId, topics.id))
      .where(eq(postTopics.postId, updatedPost.id));

    // Assemble the complete PostWithTopics response using transaction data
    const updatedPostWithTopics: PostWithTopics = {
      ...updatedPost,
      topics: postTopicRelations.map((pt) => ({
        id: pt.topicId,
        name: pt.topicName,
        slug: pt.topicSlug,
        description: pt.topicDescription,
      })),
    };

    return updatedPostWithTopics;
  });
}

export async function deletePost(slug: string): Promise<boolean> {
  try {
    const result = await db
      .delete(posts)
      .where(eq(posts.slug, slug))
      .returning();

    if (result.length === 0) {
      logger.warn('No post found to delete', { slug });
      return false;
    }

    logger.info('Post deleted successfully', {
      slug,
      deletedCount: result.length,
    });
    return true;
  } catch (error) {
    logger.error('Error deleting post', error as Error, { slug });
    return false;
  }
}
