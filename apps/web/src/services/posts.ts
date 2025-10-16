import { db } from '@/db';
import { posts, topics, postTopics } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export type PostStatus = 'DRAFT' | 'PUBLISHED';

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
  topics: Array<{
    topic: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
    };
  }>;
}

export async function createPost(
  data: CreatePostData
): Promise<PostWithTopics> {
  const { topics: topicNames, ...postData } = data;

  // Create the post
  const [newPost] = await db
    .insert(posts)
    .values({
      ...postData,
      status: postData.status,
    })
    .returning();

  if (!newPost) {
    throw new Error('Failed to create post');
  }

  // Handle topics
  const topicIds: string[] = [];
  for (const topicName of topicNames) {
    const slug = topicName.toLowerCase().replace(/\s+/g, '-');

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
          slug,
        })
        .returning();

      if (!newTopic) {
        throw new Error(`Failed to create topic: ${topicName}`);
      }
      topicId = newTopic.id;
    }

    topicIds.push(topicId);

    // Create post-topic relationship
    await db.insert(postTopics).values({
      postId: newPost.id,
      topicId,
    });
  }

  return getPostBySlug(newPost.slug) as Promise<PostWithTopics>;
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
    })
    .from(postTopics)
    .innerJoin(topics, eq(postTopics.topicId, topics.id))
    .where(eq(postTopics.postId, post[0].id));

  return {
    ...post[0],
    topics: postTopicRelations.map((pt) => ({
      topic: {
        id: pt.topicId,
        name: pt.topicName,
        slug: pt.topicSlug,
        description: null, // Topics fetched via join don't include description
      },
    })),
  } as PostWithTopics;
}

export async function getPosts(filters?: {
  status?: PostStatus;
  topic?: string;
  limit?: number;
  offset?: number;
}): Promise<PostWithTopics[]> {
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

  // If filtering by topic, we need to filter the results
  let filteredPosts = postsResult;
  if (filters?.topic) {
    // Get topic ID
    const topicResult = await db
      .select()
      .from(topics)
      .where(eq(topics.name, filters.topic))
      .limit(1);

    if (topicResult.length > 0) {
      const topicId = topicResult[0].id;

      // Get posts with this topic
      const postIdsWithTopic = await db
        .select({ postId: postTopics.postId })
        .from(postTopics)
        .where(eq(postTopics.topicId, topicId));

      const postIds = postIdsWithTopic.map((pt) => pt.postId);
      filteredPosts = postsResult.filter((p) => postIds.includes(p.id));
    } else {
      filteredPosts = [];
    }
  }

  // Fetch topics for each post
  const result: PostWithTopics[] = [];
  for (const post of filteredPosts) {
    const postWithTopics = await getPostBySlug(post.slug);
    if (postWithTopics) {
      result.push(postWithTopics);
    }
  }

  return result;
}

export async function updatePost(
  slug: string,
  data: UpdatePostData
): Promise<PostWithTopics | null> {
  const { topics: topicNames, ...updateData } = data;

  // Get the post
  const existingPost = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (existingPost.length === 0) {
    return null;
  }

  const postId = existingPost[0].id;

  // Update the post
  const [updatedPost] = await db
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
    await db.delete(postTopics).where(eq(postTopics.postId, postId));

    // Create new relationships
    for (const topicName of topicNames) {
      const slugValue = topicName.toLowerCase().replace(/\s+/g, '-');

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
            slug: slugValue,
          })
          .returning();

        if (!newTopic) {
          throw new Error(`Failed to create topic: ${topicName}`);
        }
        topicId = newTopic.id;
      }

      // Create post-topic relationship
      await db.insert(postTopics).values({
        postId,
        topicId,
      });
    }
  }

  return getPostBySlug(updatedPost.slug);
}

export async function deletePost(slug: string): Promise<boolean> {
  try {
    await db.delete(posts).where(eq(posts.slug, slug));
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}
