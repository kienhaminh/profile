import { z } from 'zod';
import { blogListItemSchema } from '@/types/blog';

export const relatedBlogSchema = z.object({
  blog: blogListItemSchema,
  score: z.number().int().nonnegative(),
  sharedTags: z.array(z.string()),
});

export type RelatedBlog = z.infer<typeof relatedBlogSchema>;

export const relatedBlogsResponseSchema = z.object({
  relatedBlogs: z.array(relatedBlogSchema),
  total: z.number().int().nonnegative(),
});

export type RelatedBlogsResponse = z.infer<typeof relatedBlogsResponseSchema>;
