import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { generateAdminToken } from '@/lib/admin-auth';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Dummy bcrypt hash for non-existent users to prevent timing attacks
const DUMMY_HASH =
  '$2a$12$dummy.hash.that.will.never.match.real.passwords.and.has.correct.bcrypt.format';

export async function authenticateUser(
  credentials: LoginCredentials
): Promise<AuthResult> {
  try {
    const user = await db
      .select()
      .from(adminUsers)
      .where(
        or(
          eq(adminUsers.username, credentials.username),
          eq(adminUsers.email, credentials.username)
        )
      )
      .limit(1);

    const adminUser = user[0];

    // Use real password hash if user exists, otherwise use dummy hash
    // This ensures consistent timing regardless of user existence
    const passwordHash = adminUser ? adminUser.password : DUMMY_HASH;

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      passwordHash
    );

    if (!adminUser || !isValidPassword) {
      return { success: false };
    }

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, adminUser.id));

    // Generate JWT token for authenticated admin
    const token = generateAdminToken(adminUser.id);

    return {
      success: true,
      token,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
      },
    };
  } catch (error: unknown) {
    // Use structured logging (e.g., winston, pino)
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Authentication failed', err, {
      errorMessage: err.message,
      // Avoid logging stack traces or sensitive details in production
    });
    return { success: false };
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
