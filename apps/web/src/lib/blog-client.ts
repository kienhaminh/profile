import type { Blog } from '@/types/blog';
import type { RelatedBlog } from '@/types/graph';

interface FetchPostBySlugOptions {
  signal?: AbortSignal;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  score: number;
}

interface RelatedPostsResponse {
  relatedBlogs: RelatedBlog[];
}

export async function fetchPostBySlug(
  slug: string,
  options?: FetchPostBySlugOptions
): Promise<Blog> {
  const response = await fetch(`/api/blog/posts/${slug}`, {
    signal: options?.signal,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Post not found');
    }
    throw new Error('Failed to load post');
  }

  return response.json();
}

export async function fetchRelatedPosts(
  postId: string,
  limit: number = 5,
  options?: FetchPostBySlugOptions
): Promise<RelatedPost[]> {
  const response = await fetch(`/api/blog/${postId}/related?limit=${limit}`, {
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch related posts');
  }

  const data: RelatedPostsResponse = await response.json();

  return (data.relatedBlogs || []).map((rb: RelatedBlog) => ({
    id: rb.blog.id,
    slug: rb.blog.slug,
    title: rb.blog.title,
    score: rb.score,
  }));
}



