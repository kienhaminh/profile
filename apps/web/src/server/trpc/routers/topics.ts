import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  TopicConflictError,
  TopicNotFoundError,
} from '@/services/topics';
import { createTopicSchema, updateTopicSchema } from '@/lib/validation';
import { adminProcedure, publicProcedure, router } from '../init';

export const topicRouter = router({
  list: publicProcedure.query(async () => listTopics()),
  create: adminProcedure
    .input(createTopicSchema)
    .mutation(async ({ input }) => {
      try {
        return await createTopic(input);
      } catch (error) {
        if (error instanceof TopicConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create topic',
        });
      }
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateTopicSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateTopic(input.id, input.data);
      } catch (error) {
        if (error instanceof TopicNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }

        if (error instanceof TopicConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update topic',
        });
      }
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        await deleteTopic(input.id);
        return true;
      } catch (error) {
        if (error instanceof TopicNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete topic',
        });
      }
    }),
});
