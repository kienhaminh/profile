// Blog service - wraps posts service for convenience
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from './posts';
import type { Blog, CreatePostInput, UpdatePostInput } from '@/types/blog';
import type { PostStatus } from '@/types/enums';
import { NotFoundError, ConflictError } from '@/lib/errors';
import type { PaginatedResult, PaginationParams } from '@/types/pagination';

export { NotFoundError, ConflictError };

export async function listBlogs(
  statusFilter?: PostStatus,
  pagination?: PaginationParams
): Promise<PaginatedResult<Blog>> {
  return getAllPosts(statusFilter, pagination);
}

export async function getBlogById(id: string): Promise<Blog> {
  return getPostById(id);
}

export async function getBlogBySlug(slug: string): Promise<Blog> {
  return getPostBySlug(slug);
}

export async function createBlog(
  input: Omit<CreatePostInput, 'authorId'>,
  authorId: string
): Promise<Blog> {
  return createPost({ ...input, authorId });
}

export async function updateBlog(
  id: string,
  input: UpdatePostInput
): Promise<Blog> {
  return updatePost(id, input);
}

export async function deleteBlog(id: string): Promise<void> {
  return deletePost(id);
}
