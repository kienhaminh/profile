import { cookies } from 'next/headers';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { timingSafeEqual } from 'crypto';
import { verifyAdminToken } from './admin-auth';

export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    return { isAuthenticated: false, user: null };
  }

  const configuredToken = process.env.ADMIN_API_TOKEN || '';

  if (
    configuredToken &&
    token.length === configuredToken.length &&
    timingSafeEqual(Buffer.from(token), Buffer.from(configuredToken))
  ) {
    return {
      isAuthenticated: true,
      user: { id: 'static-admin', role: 'admin' },
    };
  }

  // Verify JWT token
  try {
    const decoded = verifyAdminToken(token);

    // Check if admin exists in database
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, decoded.adminId))
      .limit(1);

    if (!admin) {
      return { isAuthenticated: false, user: null };
    }

    return { isAuthenticated: true, user: admin };
  } catch {
    return { isAuthenticated: false, user: null };
  }
}
