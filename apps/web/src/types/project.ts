import { z, type ZodType } from 'zod';
import type { ProjectStatus } from '@/types/enums';
import { PROJECT_STATUS_VALUES } from '@/types/enums';
import { tagSchema, type Tag } from '@/types/tag';

const projectStatusSchema = z.enum(
  PROJECT_STATUS_VALUES as [string, ...string[]]
);

export interface Project {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  description: string;
  images: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isOngoing: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export const projectSchema: ZodType<Project> = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  status: projectStatusSchema as ZodType<ProjectStatus>,
  description: z.string().min(1),
  images: z.array(z.string()),
  githubUrl: z.string().nullable().default(null),
  liveUrl: z.string().nullable().default(null),
  startDate: z.string().nullable().default(null),
  endDate: z.string().nullable().default(null),
  isOngoing: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  tags: z.array(tagSchema),
});

// Input/output DTOs
export interface CreateProjectInput {
  title: string;
  slug: string;
  status?: ProjectStatus;
  description: string;
  images?: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isOngoing?: boolean;
  tagIds?: string[];
}

export const createProjectInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  status: projectStatusSchema.optional(),
  description: z.string().min(1),
  images: z.array(z.string()).optional(),
  githubUrl: z.string().nullable().optional(),
  liveUrl: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isOngoing: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export interface UpdateProjectInput {
  title?: string;
  slug?: string;
  status?: ProjectStatus;
  description?: string;
  images?: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isOngoing?: boolean;
  tagIds?: string[];
}

export const updateProjectInputSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  status: projectStatusSchema.optional(),
  description: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  githubUrl: z.string().nullable().optional(),
  liveUrl: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isOngoing: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});
