import { db } from '../db';
import {
  posts,
  postTopics,
  postHashtags,
  type NewPost,
  type PostWithRelations,
} from '../db/schema';
import { eq, and, inArray, or, ilike, sql, desc } from 'drizzle-orm';
import type {
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogFilterParams,
} from '../lib/validation';
import type { PostStatus } from '@/types/enums';

// Type for Drizzle transaction - inferred from db type
type DrizzleTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Custom error classes for better error handling
export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

// Types for junction table objects with relations (from Drizzle 'with' clause)
interface PostTopicWithRelation {
  postId: string;
  topicId: string;
  topic: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
}

interface PostHashtagWithRelation {
  postId: string;
  hashtagId: string;
  hashtag: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
  };
}

/**
 * Blog service - Pure functions for blog post management
 * Handles blog CRUD operations with topic and hashtag associations
 * All functions follow functional programming principles
 */

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function createBlog(
  data: CreateBlogRequest,
  authorId: string
): Promise<PostWithRelations> {
  // Use transaction to ensure atomicity
  return await db.transaction(async (tx) => {
    // Create the blog post
    const newPost: NewPost = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: (data.status as PostStatus) || 'DRAFT',
      publishDate: data.publishDate ? new Date(data.publishDate) : null,
      excerpt: data.excerpt || null,
      readTime: data.readTime || null,
      coverImage: data.coverImage || null,
      authorId,
    };

    try {
      const [post] = await tx.insert(posts).values(newPost).returning();

      // Associate topics
      if (data.topicIds && data.topicIds.length > 0) {
        await tx.insert(postTopics).values(
          data.topicIds.map((topicId) => ({
            postId: post.id,
            topicId,
          }))
        );
      }

      // Associate hashtags
      if (data.hashtagIds && data.hashtagIds.length > 0) {
        await tx.insert(postHashtags).values(
          data.hashtagIds.map((hashtagId) => ({
            postId: post.id,
            hashtagId,
          }))
        );
      }

      // Return post with relations
      return await getBlogById(post.id, tx);
    } catch (error) {
      // Check for various forms of duplicate key errors
      const errorMessage = error instanceof Error ? error.message : '';
      const errorCode =
        error && typeof error === 'object' && 'code' in error ? error.code : '';
      if (
        errorCode === '23505' ||
        errorMessage?.includes('duplicate key value') ||
        errorMessage?.includes('unique constraint') ||
        errorMessage?.includes('already exists')
      ) {
        throw new Error('Blog post with this slug already exists');
      }
      throw error;
    }
  });
}

export async function getBlog(slug: string): Promise<PostWithRelations | null> {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));

  if (!post) {
    return null;
  }

  return await getBlogById(post.id);
}

export async function getBlogById(
  id: string,
  transaction?: DrizzleTransaction
): Promise<PostWithRelations> {
  const txOrDb = transaction || db;

  const post = await txOrDb.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      postTopics: {
        with: {
          topic: true,
        },
      },
      postHashtags: {
        with: {
          hashtag: true,
        },
      },
    },
  });

  if (!post) {
    throw new NotFoundError('Blog post not found');
  }

  // Transform to PostWithRelations
  return {
    ...post,
    topics: post.postTopics.map((pt: PostTopicWithRelation) => pt.topic),
    hashtags: post.postHashtags.map(
      (ph: PostHashtagWithRelation) => ph.hashtag
    ),
  };
}

export async function listBlogs(
  filters: BlogFilterParams
): Promise<PaginatedResult<PostWithRelations>> {
  const { page, limit, status, topicId, hashtagId, search } = filters;

  // Build WHERE conditions
  const conditions = [];

  if (status) {
    conditions.push(eq(posts.status, status as PostStatus));
  }

  if (topicId) {
    const postsWithTopic = await db
      .select({ id: postTopics.postId })
      .from(postTopics)
      .where(eq(postTopics.topicId, topicId));
    const postIds = postsWithTopic.map((p) => p.id);
    if (postIds.length > 0) {
      conditions.push(inArray(posts.id, postIds));
    } else {
      // No posts with this topic
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  if (hashtagId) {
    const postsWithHashtag = await db
      .select({ id: postHashtags.postId })
      .from(postHashtags)
      .where(eq(postHashtags.hashtagId, hashtagId));
    const postIds = postsWithHashtag.map((p) => p.id);
    if (postIds.length > 0) {
      conditions.push(inArray(posts.id, postIds));
    } else {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  if (search) {
    conditions.push(
      or(
        ilike(posts.title, `%${search}%`),
        ilike(posts.content, `%${search}%`)
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(whereClause);

  // Get paginated results
  const result = await db.query.posts.findMany({
    where: whereClause,
    with: {
      author: true,
      postTopics: {
        with: {
          topic: true,
        },
      },
      postHashtags: {
        with: {
          hashtag: true,
        },
      },
    },
    orderBy: [desc(posts.createdAt)],
    limit,
    offset: page * limit,
  });

  const data: PostWithRelations[] = result.map((post) => ({
    ...post,
    topics: post.postTopics.map((pt: PostTopicWithRelation) => pt.topic),
    hashtags: post.postHashtags.map(
      (ph: PostHashtagWithRelation) => ph.hashtag
    ),
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function updateBlog(
  id: string,
  data: UpdateBlogRequest
): Promise<PostWithRelations> {
  return await db.transaction(async (tx) => {
    // Check if post exists
    const existing = await tx.select().from(posts).where(eq(posts.id, id));
    if (existing.length === 0) {
      throw new NotFoundError('Blog post not found');
    }

    // Build update object
    const updateData: Partial<NewPost> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.status !== undefined) updateData.status = data.status as PostStatus;
    if (data.publishDate !== undefined) {
      updateData.publishDate = data.publishDate
        ? new Date(data.publishDate)
        : null;
    }
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
    if (data.readTime !== undefined)
      updateData.readTime = data.readTime || null;
    if (data.coverImage !== undefined) {
      updateData.coverImage = data.coverImage || null;
    }

    // Update post if there are changes
    if (Object.keys(updateData).length > 0) {
      try {
        await tx.update(posts).set(updateData).where(eq(posts.id, id));
      } catch (error) {
        const errorCode =
          error && typeof error === 'object' && 'code' in error
            ? error.code
            : '';
        if (errorCode === '23505') {
          throw new ConflictError('Blog post with this slug already exists');
        }
        throw error;
      }
    }

    // Update topics if provided
    if (data.topicIds !== undefined) {
      // Remove existing associations
      await tx.delete(postTopics).where(eq(postTopics.postId, id));
      // Add new associations
      if (data.topicIds.length > 0) {
        await tx.insert(postTopics).values(
          data.topicIds.map((topicId) => ({
            postId: id,
            topicId,
          }))
        );
      }
    }

    // Update hashtags if provided
    if (data.hashtagIds !== undefined) {
      // Remove existing associations
      await tx.delete(postHashtags).where(eq(postHashtags.postId, id));
      // Add new associations
      if (data.hashtagIds.length > 0) {
        await tx.insert(postHashtags).values(
          data.hashtagIds.map((hashtagId) => ({
            postId: id,
            hashtagId,
          }))
        );
      }
    }

    // Return updated post with relations
    return await getBlogById(id, tx);
  });
}

export async function deleteBlog(id: string): Promise<void> {
  return await db.transaction(async (tx) => {
    // Check if post exists within the transaction
    const existing = await tx.select().from(posts).where(eq(posts.id, id));
    if (existing.length === 0) {
      throw new NotFoundError('Blog post not found');
    }

    // Delete the post - cascade delete will handle associations automatically
    await tx.delete(posts).where(eq(posts.id, id));
  });
}
