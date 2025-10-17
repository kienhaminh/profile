import { initTRPC, TRPCError } from '@trpc/server';
import type { TRPCContext } from './context';

const t = initTRPC.context<TRPCContext>().create();

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.adminId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      adminId: ctx.adminId,
    },
  });
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;
export const adminProcedure = t.procedure.use(isAdmin);
