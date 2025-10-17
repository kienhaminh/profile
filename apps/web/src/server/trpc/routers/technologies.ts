import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  listTechnologies,
  createTechnology,
  updateTechnology,
  deleteTechnology,
} from '@/services/technology';
import {
  TechnologyConflictError,
  TechnologyNotFoundError,
} from '@/lib/error-utils';
import {
  createTechnologySchema,
  updateTechnologySchema,
} from '@/lib/validation';
import { adminProcedure, publicProcedure, router } from '../init';

export const technologyRouter = router({
  list: publicProcedure.query(async () => listTechnologies()),
  create: adminProcedure
    .input(createTechnologySchema)
    .mutation(async ({ input }) => {
      try {
        return await createTechnology(input);
      } catch (error) {
        if (error instanceof TechnologyConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create technology',
        });
      }
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateTechnologySchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateTechnology(input.id, input.data);
      } catch (error) {
        if (error instanceof TechnologyNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }

        if (error instanceof TechnologyConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update technology',
        });
      }
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        await deleteTechnology(input.id);
        return true;
      } catch (error) {
        if (error instanceof TechnologyNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }

        if (error instanceof TechnologyConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete technology',
        });
      }
    }),
});
