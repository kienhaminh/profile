import { cookies } from 'next/headers';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    return { isAuthenticated: false, user: null };
  }

  const configuredToken = process.env.ADMIN_API_TOKEN || '';

  if (configuredToken && token === configuredToken) {
    return { isAuthenticated: true, user: { id: 'static-admin' } };
  }

  if (token.startsWith('mock-token-')) {
    const adminId = token.replace('mock-token-', '');
    if (!adminId) {
      return { isAuthenticated: false, user: null };
    }

    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, adminId))
      .limit(1);

    if (!admin) {
      return { isAuthenticated: false, user: null };
    }

    const admins = await db.select().from(adminUsers).limit(2);
    if (admins.length !== 1) {
      return { isAuthenticated: false, user: null };
    }

    return { isAuthenticated: true, user: admin };
  }

  return { isAuthenticated: false, user: null };
}
