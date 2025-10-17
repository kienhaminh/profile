import { cache } from 'react';
import { headers } from 'next/headers';
import { appRouter } from './routers/_app';
import { createTRPCContext } from './context';

export const createServerCaller = cache(async () => {
  const headerEntries = await headers();
  const headerMap = new Headers();

  for (const [key, value] of headerEntries.entries()) {
    headerMap.set(key, value);
  }

  const ctx = await createTRPCContext({ headers: headerMap });
  return appRouter.createCaller(ctx);
});
