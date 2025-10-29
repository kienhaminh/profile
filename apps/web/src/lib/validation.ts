import { z } from 'zod';
import { POST_STATUS_VALUES, PROJECT_STATUS_VALUES } from '@/types/enums';

/**
 * Validation schemas using Zod
 * These schemas enforce type safety and data validation for all API requests
 */

// Common validators
const slugPattern = /^[a-z0-9-]+$/;
const urlSchema = z.string().url();
const uuidSchema = z.string().uuid();

// Blog validation schemas
export const createBlogSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(slugPattern, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  content: z.string().min(1),
  status: z.enum(POST_STATUS_VALUES as [string, ...string[]]),
  publishDate: z.string().datetime().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  readTime: z.number().int().positive().optional().nullable(),
  coverImage: urlSchema.optional().nullable(),
  authorId: uuidSchema.optional(),
  topicIds: z.array(uuidSchema).optional().default([]),
  hashtagIds: z.array(uuidSchema).optional().default([]),
});

export const updateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().regex(slugPattern).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(POST_STATUS_VALUES as [string, ...string[]]).optional(),
  publishDate: z.string().datetime().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  readTime: z.number().int().positive().optional().nullable(),
  coverImage: urlSchema.optional().nullable(),
  topicIds: z.array(uuidSchema).optional(),
  hashtagIds: z.array(uuidSchema).optional(),
});

// Post validation schemas
export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishDate: z.string().datetime().optional(),
  coverImage: urlSchema.optional(),
  topics: z.array(z.string()).optional(),
});

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(slugPattern, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  description: z.string().min(1),
  status: z.enum(PROJECT_STATUS_VALUES as [string, ...string[]]).default('DRAFT'),
  images: z.array(urlSchema).default([]),
  githubUrl: urlSchema.optional().nullable(),
  liveUrl: urlSchema.optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isOngoing: z.boolean().default(false),
  technologyIds: z.array(uuidSchema).optional().default([]),
  hashtagIds: z.array(uuidSchema).optional().default([]),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().regex(slugPattern).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(PROJECT_STATUS_VALUES as [string, ...string[]]).optional(),
  images: z.array(urlSchema).optional(),
  githubUrl: urlSchema.optional().nullable(),
  liveUrl: urlSchema.optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isOngoing: z.boolean().optional(),
  technologyIds: z.array(uuidSchema).optional(),
  hashtagIds: z.array(uuidSchema).optional(),
});

// Hashtag validation schemas
export const createHashtagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().regex(slugPattern, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  description: z.string().max(200).optional().nullable(),
});

export const updateHashtagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z.string().regex(slugPattern).optional(),
  description: z.string().max(200).optional().nullable(),
});

// Topic validation schemas
export const createTopicSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().regex(slugPattern, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  description: z.string().max(200).optional().nullable(),
});

export const updateTopicSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z.string().regex(slugPattern).optional(),
  description: z.string().max(200).optional().nullable(),
});

// Technology validation schemas
export const createTechnologySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().regex(slugPattern, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  description: z.string().max(200).optional().nullable(),
});

export const updateTechnologySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z.string().regex(slugPattern).optional(),
  description: z.string().max(200).optional().nullable(),
});

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const blogFilterSchema = paginationSchema.extend({
  status: z.enum(POST_STATUS_VALUES as [string, ...string[]]).optional(),
  topicId: uuidSchema.optional(),
  hashtagId: uuidSchema.optional(),
  search: z.string().optional(),
});

export const projectFilterSchema = paginationSchema.extend({
  status: z.enum(PROJECT_STATUS_VALUES as [string, ...string[]]).optional(),
  technologyId: uuidSchema.optional(),
  hashtagId: uuidSchema.optional(),
  search: z.string().optional(),
});

// TypeScript types inferred from schemas
export type CreateBlogRequest = z.infer<typeof createBlogSchema>;
export type UpdateBlogRequest = z.infer<typeof updateBlogSchema>;
export type UpdatePostRequest = z.infer<typeof updatePostSchema>;
export type CreateProjectRequest = z.infer<typeof createProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;
export type CreateHashtagRequest = z.infer<typeof createHashtagSchema>;
export type UpdateHashtagRequest = z.infer<typeof updateHashtagSchema>;
export type CreateTopicRequest = z.infer<typeof createTopicSchema>;
export type UpdateTopicRequest = z.infer<typeof updateTopicSchema>;
export type CreateTechnologyRequest = z.infer<typeof createTechnologySchema>;
export type UpdateTechnologyRequest = z.infer<typeof updateTechnologySchema>;
export type BlogFilterParams = z.infer<typeof blogFilterSchema>;
export type ProjectFilterParams = z.infer<typeof projectFilterSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
