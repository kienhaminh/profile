import { z } from 'zod';
import type { PostStatus } from './enums';
import { POST_STATUS_VALUES } from './enums';

export interface BlogSeries {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: PostStatus;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export const blogSeriesSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().default(null),
  status: z.enum(POST_STATUS_VALUES as [string, ...string[]]),
  coverImage: z.string().nullable().default(null),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

// Input DTOs
export interface CreateSeriesInput {
  title: string;
  slug: string;
  description?: string | null;
  status?: PostStatus;
  coverImage?: string | null;
}

export const createSeriesInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  description: z.string().nullable().optional(),
  status: z.enum(POST_STATUS_VALUES as [string, ...string[]]).optional(),
  coverImage: z.string().nullable().optional(),
});

export interface UpdateSeriesInput {
  title?: string;
  slug?: string;
  description?: string | null;
  status?: PostStatus;
  coverImage?: string | null;
}

export const updateSeriesInputSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    )
    .optional(),
  description: z.string().nullable().optional(),
  status: z.enum(POST_STATUS_VALUES as [string, ...string[]]).optional(),
  coverImage: z.string().nullable().optional(),
});

// Series with post count for admin list
export interface SeriesWithCount extends BlogSeries {
  postCount: number;
}
