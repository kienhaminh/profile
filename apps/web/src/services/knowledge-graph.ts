// Knowledge graph service - for related content recommendations
import { db } from '@/db/client';
import { posts, postTags, tags } from '@/db/schema';
import { eq, and, ne, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import type { BlogListItem } from '@/types/blog';
import type { Tag } from '@/types/tag';
import type { PostStatus } from '@/types/enums';
import { POST_STATUS } from '@/types/enums';

interface RelatedBlog {
  blog: BlogListItem;
  score: number;
  sharedTags: string[];
}

export async function getRelatedBlogsById(
  blogId: string,
  limit: number = 5
): Promise<RelatedBlog[]> {
  try {
    // Get tags for the current blog
    const currentBlogTags = await db
      .select({ tagId: postTags.tagId })
      .from(postTags)
      .where(eq(postTags.postId, blogId));

    if (currentBlogTags.length === 0) {
      return [];
    }

    const tagIds = currentBlogTags.map((t) => t.tagId);

    // Find other blogs that share tags
    const relatedPosts = await db
      .select({
        postId: postTags.postId,
        tagId: postTags.tagId,
      })
      .from(postTags)
      .where(
        and(
          ne(postTags.postId, blogId),
          sql`${postTags.tagId} = ANY(${tagIds})`
        )
      );

    // Group by postId and count shared tags
    const postScores = new Map<
      string,
      { score: number; sharedTagIds: Set<string> }
    >();

    for (const { postId, tagId } of relatedPosts) {
      const current = postScores.get(postId) || {
        score: 0,
        sharedTagIds: new Set<string>(),
      };
      current.score += 1;
      current.sharedTagIds.add(tagId);
      postScores.set(postId, current);
    }

    // Get the top related posts
    const sortedPostIds = Array.from(postScores.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([postId, data]) => ({ postId, ...data }));

    // Fetch full post details with tags
    const relatedBlogs: RelatedBlog[] = [];

    for (const { postId, score, sharedTagIds } of sortedPostIds) {
      const [post] = await db
        .select()
        .from(posts)
        .where(
          and(eq(posts.id, postId), eq(posts.status, POST_STATUS.PUBLISHED))
        )
        .limit(1);

      if (!post) continue;

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

      const sharedTagLabels = tagsList
        .filter((t) => sharedTagIds.has(t.id))
        .map((t) => t.label);

      relatedBlogs.push({
        blog: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status as PostStatus,
          publishDate: post.publishDate?.toISOString() || null,
          excerpt: post.excerpt,
          readTime: post.readTime,
          coverImage: post.coverImage,
          author: {
            id: post.authorId,
            name: 'Author',
            bio: null,
            avatar: null,
            socialLinks: {},
            email: null,
          }, // Simplified - should fetch actual author data
          tags: tagsList,
        },
        score,
        sharedTags: sharedTagLabels,
      });
    }

    return relatedBlogs;
  } catch (error) {
    logger.error('Error getting related blogs', { error, blogId });
    throw new Error('Failed to get related blogs');
  }
}
