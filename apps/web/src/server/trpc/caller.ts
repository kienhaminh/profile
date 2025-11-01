import { appRouter } from './routers/_app';
import type { Context } from './context';

/**
 * Creates a server-side caller for tRPC
 * This allows calling tRPC procedures directly from server-side code
 */
export function createServerCaller(context: Context) {
  return appRouter.createCaller(context);
}
