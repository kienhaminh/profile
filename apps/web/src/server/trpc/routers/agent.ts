import { TRPCError } from '@trpc/server';
import { agentInputSchema } from '@/types/agent';
import { runAgent } from '@/services/agent/graph';
import { logger } from '@/lib/logger';
import { publicProcedure, router } from '../init';

export const agentRouter = router({
  respond: publicProcedure
    .input(agentInputSchema)
    .mutation(async ({ input }) => {
      try {
        logger.info('Agent tRPC mutation invoked', {
          messageLength: input.message.length,
          hasHistory: (input.conversationHistory?.length ?? 0) > 0,
        });

        const response = await runAgent(input);

        return {
          text: response,
        };
      } catch (error) {
        const errorInstance =
          error instanceof Error ? error : new Error('Unknown error');
        logger.error('Agent tRPC mutation failed', errorInstance);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorInstance.message,
          cause: errorInstance,
        });
      }
    }),
});
