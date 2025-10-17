import { db } from '@/db';
import { getAdminFromHeaders } from '@/lib/admin-auth';

export interface CreateTRPCContextOptions {
  headers: Headers;
}

export async function createTRPCContext(opts: CreateTRPCContextOptions) {
  const requestHeaders = new Headers(opts.headers);
  const admin = await getAdminFromHeaders(requestHeaders);

  return {
    db,
    headers: requestHeaders,
    admin,
    adminId: admin?.adminId ?? null,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
