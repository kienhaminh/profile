import { z } from 'zod';

export const relatedBlogSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  score: z.number().int().nonnegative(),
});

export type RelatedBlog = z.infer<typeof relatedBlogSchema>;

export const relatedBlogsResponseSchema = z.object({
  data: z.array(relatedBlogSchema),
});

export type RelatedBlogsResponse = z.infer<typeof relatedBlogsResponseSchema>;
