// Re-export validation schemas from @/types for convenience
export {
  createPostInputSchema as createBlogSchema,
  updatePostInputSchema as updateBlogSchema,
  updatePostInputSchema as updatePostSchema,
  type CreatePostInput as CreateBlogRequest,
} from '@/types/blog';

export {
  createProjectInputSchema as createProjectSchema,
  updateProjectInputSchema as updateProjectSchema,
  type CreateProjectInput as CreateProjectRequest,
} from '@/types/project';

export {
  createTagInputSchema as createHashtagSchema,
  updateTagInputSchema as updateHashtagSchema,
  createTagInputSchema as createTechnologySchema,
  updateTagInputSchema as updateTechnologySchema,
  createTagInputSchema as createTopicSchema,
  updateTagInputSchema as updateTopicSchema,
} from '@/types/tag';

import { z } from 'zod';
import { POST_STATUS_VALUES, PROJECT_STATUS_VALUES } from '@/types/enums';

// Filter schemas
export const blogFilterSchema = z.object({
  status: z.enum(POST_STATUS_VALUES as [string, ...string[]]).optional(),
  tagId: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export const projectFilterSchema = z.object({
  status: z.enum(PROJECT_STATUS_VALUES as [string, ...string[]]).optional(),
  tagId: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});
