import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { verifyAdminToken } from '@/lib/auth';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: shape.data.code,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const isAdmin = middleware(async ({ ctx, next }) => {
  // Try to get token from Authorization header or cookie
  const authHeader = ctx.req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  const cookieToken = ctx.cookies.get('admin-token')?.value;

  const token = bearerToken || cookieToken;

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing token' });
  }

  try {
    verifyAdminToken(token);
  } catch (error) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }

  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});

export const adminProcedure = publicProcedure.use(isAdmin);
