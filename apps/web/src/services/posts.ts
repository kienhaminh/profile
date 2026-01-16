import { db } from '@/db/client';
import { posts, postTags, tags, users, blogSeries } from '@/db/schema';
import { eq, desc, count, ilike, or, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { NotFoundError } from '@/lib/errors';
import type { Blog, CreatePostInput, UpdatePostInput } from '@/types/blog';
import { createPostInputSchema, updatePostInputSchema } from '@/types/blog';
import { POST_STATUS, type PostStatus } from '@/types/enums';
import type { Tag } from '@/types/tag';
import type { Author } from '@/types/author';
import type { PaginatedResult, PaginationParams } from '@/types/pagination';

function normalizePost(
  dbPost: typeof posts.$inferSelect,
  author: Author,
  postTagsList: Tag[],
  series?: { id: string; title: string; slug: string } | null
): Blog {
  return {
    id: dbPost.id,
    title: dbPost.title,
    slug: dbPost.slug,
    status: dbPost.status as PostStatus,
    publishDate: dbPost.publishDate?.toISOString() || null,
    content: dbPost.content,
    excerpt: dbPost.excerpt,
    readTime: dbPost.readTime,
    coverImage: dbPost.coverImage,
    series: series || null,
    seriesOrder: dbPost.seriesOrder,
    createdAt: dbPost.createdAt.toISOString(),
    updatedAt: dbPost.updatedAt.toISOString(),
    author,
    tags: postTagsList,
  };
}

export async function getAllPosts(
  statusFilter?: PostStatus,
  pagination?: PaginationParams,
  search?: string
): Promise<PaginatedResult<Blog>> {
  try {
    const hasPagination =
      typeof pagination?.limit === 'number' && pagination.limit > 0;
    const limit = hasPagination ? Math.max(1, pagination!.limit!) : undefined;
    let currentPage = hasPagination ? Math.max(1, pagination!.page ?? 1) : 1;
    let offset = hasPagination && limit ? (currentPage - 1) * limit : undefined;

    let total = 0;
    let totalPages = 0;

    if (hasPagination && limit) {
      const whereConditions = [];
      if (statusFilter) whereConditions.push(eq(posts.status, statusFilter));
      if (search) {
        whereConditions.push(
          or(
            ilike(posts.title, `%${search}%`),
            ilike(posts.slug, `%${search}%`)
          )
        );
      }

      const totalResult = await db
        .select({ value: count() })
        .from(posts)
        .where(and(...whereConditions));

      total = Number(totalResult[0]?.value ?? 0);
      totalPages = total === 0 ? 0 : Math.ceil(total / limit);

      if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
        offset = (currentPage - 1) * limit;
      } else if (totalPages === 0) {
        currentPage = 1;
        offset = 0;
      }
    }

    let query = db.select().from(posts).$dynamic();
    const whereConditions = [];
    if (statusFilter) whereConditions.push(eq(posts.status, statusFilter));
    if (search) {
      whereConditions.push(
        or(ilike(posts.title, `%${search}%`), ilike(posts.slug, `%${search}%`))
      );
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    query = query.orderBy(desc(posts.createdAt));

    if (hasPagination && limit) {
      query = query.limit(limit).offset(offset ?? 0);
    }

    const result = await query;

    if (!hasPagination) {
      total = result.length;
      totalPages = total === 0 ? 0 : 1;
    }

    const postsWithRelations = await Promise.all(
      result.map(async (post) => {
        const author = await db
          .select()
          .from(users)
          .where(eq(users.id, post.authorId))
          .limit(1);

        const postTagsResult = await db
          .select({ tag: tags })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(eq(postTags.postId, post.id));

        const tagsList: Tag[] = postTagsResult.map((pt) => ({
          id: pt.tag.id,
          slug: pt.tag.slug,
          label: pt.tag.label,
          description: pt.tag.description,
          createdAt: pt.tag.createdAt.toISOString(),
          updatedAt: pt.tag.updatedAt.toISOString(),
        }));

        // Get series information if post belongs to one
        let seriesInfo = null;
        if (post.seriesId) {
          const seriesResult = await db
            .select({
              id: blogSeries.id,
              title: blogSeries.title,
              slug: blogSeries.slug,
            })
            .from(blogSeries)
            .where(eq(blogSeries.id, post.seriesId))
            .limit(1);
          if (seriesResult.length > 0) {
            seriesInfo = seriesResult[0];
          }
        }

        const authorData: Author = {
          id: author[0].id,
          name: author[0].username,
          bio: null,
          avatar: null,
          socialLinks: {},
          email: null,
        };

        return normalizePost(post, authorData, tagsList, seriesInfo);
      })
    );

    return {
      data: postsWithRelations,
      pagination: {
        page: currentPage,
        limit: hasPagination ? limit! : postsWithRelations.length,
        total,
        totalPages,
      },
    };
  } catch (error) {
    logger.error('Error getting all posts', { error, statusFilter });
    throw new Error('Failed to get posts');
  }
}

export async function getPostById(id: string): Promise<Blog> {
  try {
    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError(`Post not found: ${id}`);
    }

    const post = result[0];

    const author = await db
      .select()
      .from(users)
      .where(eq(users.id, post.authorId))
      .limit(1);

    const postTagsResult = await db
      .select({ tag: tags })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id));

    const tagsList: Tag[] = postTagsResult.map((pt) => ({
      id: pt.tag.id,
      slug: pt.tag.slug,
      label: pt.tag.label,
      description: pt.tag.description,
      createdAt: pt.tag.createdAt.toISOString(),
      updatedAt: pt.tag.updatedAt.toISOString(),
    }));

    // Get series information if post belongs to one
    let seriesInfo = null;
    if (post.seriesId) {
      const seriesResult = await db
        .select({
          id: blogSeries.id,
          title: blogSeries.title,
          slug: blogSeries.slug,
        })
        .from(blogSeries)
        .where(eq(blogSeries.id, post.seriesId))
        .limit(1);
      if (seriesResult.length > 0) {
        seriesInfo = seriesResult[0];
      }
    }

    const authorData: Author = {
      id: author[0].id,
      name: author[0].username,
      bio: null,
      avatar: null,
      socialLinks: {},
      email: null,
    };

    return normalizePost(post, authorData, tagsList, seriesInfo);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error getting post by ID', { error, id });
    throw new Error('Failed to get post');
  }
}

export async function getPostBySlug(slug: string): Promise<Blog> {
  try {
    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    if (result.length === 0) {
      throw new NotFoundError(`Post not found: ${slug}`);
    }

    const post = result[0];

    const author = await db
      .select()
      .from(users)
      .where(eq(users.id, post.authorId))
      .limit(1);

    const postTagsResult = await db
      .select({ tag: tags })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id));

    const tagsList: Tag[] = postTagsResult.map((pt) => ({
      id: pt.tag.id,
      slug: pt.tag.slug,
      label: pt.tag.label,
      description: pt.tag.description,
      createdAt: pt.tag.createdAt.toISOString(),
      updatedAt: pt.tag.updatedAt.toISOString(),
    }));

    // Get series information if post belongs to one
    let seriesInfo = null;
    if (post.seriesId) {
      const seriesResult = await db
        .select({
          id: blogSeries.id,
          title: blogSeries.title,
          slug: blogSeries.slug,
        })
        .from(blogSeries)
        .where(eq(blogSeries.id, post.seriesId))
        .limit(1);
      if (seriesResult.length > 0) {
        seriesInfo = seriesResult[0];
      }
    }

    const authorData: Author = {
      id: author[0].id,
      name: author[0].username,
      bio: null,
      avatar: null,
      socialLinks: {},
      email: null,
    };

    return normalizePost(post, authorData, tagsList, seriesInfo);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error getting post by slug', { error, slug });
    throw new Error('Failed to get post');
  }
}

export async function createPost(input: CreatePostInput): Promise<Blog> {
  const validated = createPostInputSchema.parse(input);

  try {
    const result = await db
      .insert(posts)
      .values({
        title: validated.title,
        slug: validated.slug,
        status: validated.status || POST_STATUS.DRAFT,
        publishDate: validated.publishDate
          ? new Date(validated.publishDate)
          : null,
        content: validated.content,
        excerpt: validated.excerpt || null,
        readTime: validated.readTime || null,
        coverImage: validated.coverImage || null,
        seriesId: validated.seriesId || null,
        seriesOrder: validated.seriesOrder || null,
        authorId: validated.authorId,
      })
      .returning();

    const post = result[0];

    // Insert tag relations
    if (validated.tagIds && validated.tagIds.length > 0) {
      await db.insert(postTags).values(
        validated.tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        }))
      );
    }

    logger.info('Post created', { id: post.id, slug: post.slug });

    return getPostById(post.id);
  } catch (error) {
    logger.error('Error creating post', { error, input });
    throw new Error('Failed to create post');
  }
}

export async function updatePost(
  id: string,
  input: UpdatePostInput
): Promise<Blog> {
  const validated = updatePostInputSchema.parse(input);

  try {
    // Check if post exists
    await getPostById(id);

    // Prepare update data
    const updateData: Partial<typeof posts.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.publishDate !== undefined)
      updateData.publishDate = validated.publishDate
        ? new Date(validated.publishDate)
        : null;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.excerpt !== undefined) updateData.excerpt = validated.excerpt;
    if (validated.readTime !== undefined)
      updateData.readTime = validated.readTime;
    if (validated.coverImage !== undefined)
      updateData.coverImage = validated.coverImage;
    if (validated.seriesId !== undefined)
      updateData.seriesId = validated.seriesId;
    if (validated.seriesOrder !== undefined)
      updateData.seriesOrder = validated.seriesOrder;

    await db.update(posts).set(updateData).where(eq(posts.id, id));

    // Update tag relations if provided
    if (validated.tagIds !== undefined) {
      // Delete existing relations
      await db.delete(postTags).where(eq(postTags.postId, id));

      // Insert new relations
      if (validated.tagIds.length > 0) {
        await db.insert(postTags).values(
          validated.tagIds.map((tagId) => ({
            postId: id,
            tagId,
          }))
        );
      }
    }

    logger.info('Post updated', { id });

    return getPostById(id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error updating post', { error, id, input });
    throw new Error('Failed to update post');
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    // Check if post exists
    await getPostById(id);

    // Delete post (cascade will handle postTags)
    await db.delete(posts).where(eq(posts.id, id));

    logger.info('Post deleted', { id });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error deleting post', { error, id });
    throw new Error('Failed to delete post');
  }
}
