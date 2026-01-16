import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { cookies } from 'next/headers';

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const cookieStore = await cookies();
  return {
    req: opts.req,
    cookies: cookieStore,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
