import { z } from 'zod';

export interface Tag {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export const tagSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  label: z.string().min(1),
  description: z.string().nullable().default(null),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

// Input/output DTOs
export interface CreateTagInput {
  slug: string;
  label: string;
  description?: string | null;
}

export const createTagInputSchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  description: z.string().nullable().optional(),
});

export interface UpdateTagInput {
  slug?: string;
  label?: string;
  description?: string | null;
}

export const updateTagInputSchema = z.object({
  slug: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});
