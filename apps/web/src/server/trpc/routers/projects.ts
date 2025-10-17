import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  listProjects,
  getProjectById,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  ProjectNotFoundError,
  ProjectConflictError,
} from '@/services/project';
import {
  createProjectSchema,
  updateProjectSchema,
  projectFilterSchema,
} from '@/lib/validation';
import { adminProcedure, publicProcedure, router } from '../init';

const projectListInput = z
  .object({
    page: z.number().int().min(0).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    technologyId: z.string().uuid().optional(),
    hashtagId: z.string().uuid().optional(),
    search: z.string().optional(),
  })
  .optional();

export const projectRouter = router({
  list: publicProcedure.input(projectListInput).query(async ({ input }) => {
    const filters = projectFilterSchema.parse({
      page: input?.page ?? 0,
      limit: input?.limit ?? 20,
      status: input?.status ?? 'PUBLISHED',
      technologyId: input?.technologyId,
      hashtagId: input?.hashtagId,
      search: input?.search,
    });

    return listProjects(filters);
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        return await getProjectById(input.id);
      } catch (error) {
        if (error instanceof ProjectNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch project',
        });
      }
    }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const project = await getProject(input.slug);
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      return project;
    }),
  create: adminProcedure
    .input(createProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await createProject(input);
      } catch (error) {
        if (error instanceof ProjectConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create project',
        });
      }
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateProjectSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateProject(input.id, input.data);
      } catch (error) {
        if (error instanceof ProjectNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }

        if (error instanceof ProjectConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update project',
        });
      }
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        await deleteProject(input.id);
        return true;
      } catch (error) {
        if (error instanceof ProjectNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete project',
        });
      }
    }),
});
