import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  return {
    req: opts.req,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
