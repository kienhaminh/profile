import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/routers/_app';
import { createTRPCContext } from '@/server/trpc/context';
import { logger } from '@/lib/logger';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts) => createTRPCContext(opts),
    onError({ error, path }) {
      logger.error(`TRPC Error on '${path ?? '<no-path>'}':`, { error, path });
    },
  });

export { handler as GET, handler as POST, handler as OPTIONS };
export const runtime = 'nodejs';
