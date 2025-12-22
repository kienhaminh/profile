import { cookies } from 'next/headers';
import { verifyAdminToken, type DecodedToken } from './auth';

export interface ServerAuthResult {
  isAuthenticated: boolean;
  user: {
    id: string;
    role: string;
  } | null;
}

/**
 * Server-side authentication check for use in Server Components
 */
export async function getServerAuth(): Promise<ServerAuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    // Check for static token first
    const configuredToken = process.env.ADMIN_API_TOKEN;
    if (configuredToken && token === configuredToken) {
      return {
        isAuthenticated: true,
        user: {
          id: 'admin',
          role: 'admin',
        },
      };
    }

    // Verify JWT token
    const decoded: DecodedToken = verifyAdminToken(token);

    return {
      isAuthenticated: true,
      user: {
        id: decoded.adminId,
        role: 'admin', // Could be expanded to include role from token
      },
    };
  } catch {
    return {
      isAuthenticated: false,
      user: null,
    };
  }
}

/**
 * Require admin authentication for server actions.
 * Throws UnauthorizedError if not authenticated or not admin.
 * Use this in server actions that modify data.
 */
export async function requireAdminAuth(): Promise<{
  id: string;
  role: string;
}> {
  // Import here to avoid circular dependencies
  const { UnauthorizedError } = await import('@/lib/errors');

  const { isAuthenticated, user } = await getServerAuth();

  if (!isAuthenticated || !user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (user.role !== 'admin') {
    throw new UnauthorizedError('Admin access required');
  }

  return user;
}
