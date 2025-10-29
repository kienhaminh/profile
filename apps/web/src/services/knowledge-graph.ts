import { db } from '@/db';
import { posts, postTopics, postHashtags } from '@/db/schema';
import { eq, and, inArray, ne, sql } from 'drizzle-orm';
import type { RelatedBlog } from '@/types/graph';
import { logger } from '@/lib/logger';

const WEIGHTS = {
  link: 4,
  topic: 3,
  tech: 2, // Reserved for future use when posts have tech associations
  hashtag: 1,
} as const;

interface PostRelations {
  id: string;
  slug: string;
  title: string;
  content: string;
  topicIds: string[];
  hashtagIds: string[];
}

/**
 * Extract referenced blog slugs from post content.
 * Looks for patterns like: /blog/[slug], href="/blog/[slug]", or markdown links.
 */
function extractLinkedSlugs(content: string): string[] {
  const slugPattern =
    /(?:\/blog\/|href=["']\/blog\/|\]\(\/blog\/)([a-z0-9-]+)/gi;
  const matches = content.matchAll(slugPattern);
  const slugs = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      slugs.add(match[1]);
    }
  }

  return Array.from(slugs);
}

/**
 * Load a post with its relations by slug.
 */
async function loadPostWithRelations(
  slug: string
): Promise<PostRelations | null> {
  try {
    const [post] = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        content: posts.content,
        status: posts.status,
      })
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.status, 'PUBLISHED')));

    if (!post) {
      return null;
    }

    // Load topics
    const topicsResult = await db
      .select({ topicId: postTopics.topicId })
      .from(postTopics)
      .where(eq(postTopics.postId, post.id));
    const topicIds = topicsResult.map((t) => t.topicId);

    // Load hashtags
    const hashtagsResult = await db
      .select({ hashtagId: postHashtags.hashtagId })
      .from(postHashtags)
      .where(eq(postHashtags.postId, post.id));
    const hashtagIds = hashtagsResult.map((h) => h.hashtagId);

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      topicIds,
      hashtagIds,
    };
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error loading post with relations', errorInstance);
    throw errorInstance;
  }
}

/**
 * Load candidate posts that share at least one topic or hashtag with the source post.
 */
async function loadCandidatePosts(
  sourcePost: PostRelations
): Promise<PostRelations[]> {
  try {
    // Find posts sharing topics or hashtags
    const relatedPostIds = new Set<string>();

    if (sourcePost.topicIds.length > 0) {
      const topicMatches = await db
        .select({ postId: postTopics.postId })
        .from(postTopics)
        .where(
          and(
            inArray(postTopics.topicId, sourcePost.topicIds),
            ne(postTopics.postId, sourcePost.id)
          )
        );
      topicMatches.forEach((m) => relatedPostIds.add(m.postId));
    }

    if (sourcePost.hashtagIds.length > 0) {
      const hashtagMatches = await db
        .select({ postId: postHashtags.postId })
        .from(postHashtags)
        .where(
          and(
            inArray(postHashtags.hashtagId, sourcePost.hashtagIds),
            ne(postHashtags.postId, sourcePost.id)
          )
        );
      hashtagMatches.forEach((m) => relatedPostIds.add(m.postId));
    }

    if (relatedPostIds.size === 0) {
      return [];
    }

    const candidatePostIds = Array.from(relatedPostIds);

    // Load candidate posts with their relations
    const candidatePosts = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        content: posts.content,
      })
      .from(posts)
      .where(
        and(inArray(posts.id, candidatePostIds), eq(posts.status, 'PUBLISHED'))
      );

    // Load relations for each candidate
    const candidatesWithRelations = await Promise.all(
      candidatePosts.map(async (post) => {
        const topicsResult = await db
          .select({ topicId: postTopics.topicId })
          .from(postTopics)
          .where(eq(postTopics.postId, post.id));
        const topicIds = topicsResult.map((t) => t.topicId);

        const hashtagsResult = await db
          .select({ hashtagId: postHashtags.hashtagId })
          .from(postHashtags)
          .where(eq(postHashtags.postId, post.id));
        const hashtagIds = hashtagsResult.map((h) => h.hashtagId);

        return {
          ...post,
          topicIds,
          hashtagIds,
        };
      })
    );

    return candidatesWithRelations;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error loading candidate posts', errorInstance);
    throw errorInstance;
  }
}

/**
 * Compute similarity score between two posts.
 */
function computeScore(
  sourcePost: PostRelations,
  candidatePost: PostRelations,
  linkedSlugs: Set<string>
): number {
  let score = 0;

  // Count shared topics
  const sharedTopics = sourcePost.topicIds.filter((id) =>
    candidatePost.topicIds.includes(id)
  ).length;
  score += sharedTopics * WEIGHTS.topic;

  // Count shared hashtags
  const sharedHashtags = sourcePost.hashtagIds.filter((id) =>
    candidatePost.hashtagIds.includes(id)
  ).length;
  score += sharedHashtags * WEIGHTS.hashtag;

  // Check if source post links to this candidate
  if (linkedSlugs.has(candidatePost.slug)) {
    score += WEIGHTS.link;
  }

  return score;
}

/**
 * Get related blogs for a given blog post by slug.
 * Returns an array of related posts sorted by relevance score.
 */
export async function getRelatedBlogsBySlug(
  slug: string,
  limit = 5
): Promise<RelatedBlog[]> {
  try {
    logger.info('Computing related blogs', { slug, limit });

    // Load the source post with relations
    const sourcePost = await loadPostWithRelations(slug);
    if (!sourcePost) {
      logger.warn('Source post not found', { slug });
      return [];
    }

    // Extract linked slugs from content
    const linkedSlugs = new Set(extractLinkedSlugs(sourcePost.content));

    // Load candidate posts
    const candidates = await loadCandidatePosts(sourcePost);
    if (candidates.length === 0) {
      logger.info('No candidate posts found', { slug });
      return [];
    }

    // Compute scores and sort
    const scoredCandidates = candidates
      .map((candidate) => ({
        id: candidate.id,
        slug: candidate.slug,
        title: candidate.title,
        score: computeScore(sourcePost, candidate, linkedSlugs),
      }))
      .filter((c) => c.score > 0) // Only return posts with some connection
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    logger.info('Related blogs computed', {
      slug,
      candidatesFound: candidates.length,
      relatedCount: scoredCandidates.length,
    });

    return scoredCandidates;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error computing related blogs', errorInstance);
    throw new Error(
      `Failed to compute related blogs: ${errorInstance.message}`
    );
  }
}

/**
 * Get related blogs by post ID (slug lookup wrapper).
 */
export async function getRelatedBlogsById(
  id: string,
  limit = 5
): Promise<RelatedBlog[]> {
  try {
    // Find slug by ID
    const [post] = await db
      .select({ slug: posts.slug })
      .from(posts)
      .where(and(eq(posts.id, id), eq(posts.status, 'PUBLISHED')));

    if (!post) {
      logger.warn('Post not found by ID', { id });
      return [];
    }

    return await getRelatedBlogsBySlug(post.slug, limit);
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error getting related blogs by ID', errorInstance);
    throw new Error(
      `Failed to get related blogs by ID: ${errorInstance.message}`
    );
  }
}
