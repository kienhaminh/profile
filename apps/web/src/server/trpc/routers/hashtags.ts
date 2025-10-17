import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  listHashtags,
  createHashtag,
  updateHashtag,
  deleteHashtag,
  ConflictError as HashtagConflictError,
} from '@/services/hashtag';
import {
  createHashtagSchema,
  updateHashtagSchema,
} from '@/lib/validation';
import { adminProcedure, publicProcedure, router } from '../init';

const HASHTAG_NOT_FOUND = 'Hashtag not found';

export const hashtagRouter = router({
  list: publicProcedure.query(async () => listHashtags()),
  create: adminProcedure
    .input(createHashtagSchema)
    .mutation(async ({ input }) => {
      try {
        return await createHashtag(input);
      } catch (error) {
        if (error instanceof HashtagConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create hashtag',
        });
      }
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateHashtagSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateHashtag(input.id, input.data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes('not found')
        ) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: HASHTAG_NOT_FOUND,
          });
        }

        if (error instanceof HashtagConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update hashtag',
        });
      }
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        await deleteHashtag(input.id);
        return true;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes('not found')
        ) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: HASHTAG_NOT_FOUND,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete hashtag',
        });
      }
    }),
});
