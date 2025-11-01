import { z, type ZodType } from 'zod';
import type { PostStatus } from '@/types/enums';
import { POST_STATUS_VALUES } from '@/types/enums';
import { authorSchema, type Author } from '@/types/author';
import { tagSchema, type Tag } from '@/types/tag';

const postStatusSchema = z.enum(POST_STATUS_VALUES as [string, ...string[]]);

export interface Blog {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  publishDate: string | null;
  content: string;
  excerpt: string | null;
  readTime: number | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  tags: Tag[];
}

export const blogSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  status: postStatusSchema as ZodType<PostStatus>,
  publishDate: z.string().nullable().default(null),
  content: z.string().min(1),
  excerpt: z.string().nullable().default(null),
  readTime: z.number().int().nullable().default(null),
  coverImage: z.string().nullable().default(null),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  author: authorSchema,
  tags: z.array(tagSchema),
}) satisfies ZodType<Blog>;

export const blogListItemSchema = blogSchema.omit({
  content: true,
  createdAt: true,
  updatedAt: true,
});

export type BlogListItem = z.infer<typeof blogListItemSchema>;

// Input/output DTOs
export interface CreatePostInput {
  title: string;
  slug: string;
  status?: PostStatus;
  publishDate?: string | null;
  content: string;
  excerpt?: string | null;
  readTime?: number | null;
  coverImage?: string | null;
  authorId: string;
  tagIds?: string[];
}

export const createPostInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  status: postStatusSchema.optional(),
  publishDate: z.string().nullable().optional(),
  content: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  readTime: z.number().int().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  authorId: z.string().uuid(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  status?: PostStatus;
  publishDate?: string | null;
  content?: string;
  excerpt?: string | null;
  readTime?: number | null;
  coverImage?: string | null;
  tagIds?: string[];
}

export const updatePostInputSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  status: postStatusSchema.optional(),
  publishDate: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().nullable().optional(),
  readTime: z.number().int().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});
