import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

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

    if (user.length === 0) {
      return { success: false };
    }

    const adminUser = user[0];
    const isValidPassword = await bcrypt.compare(
      credentials.password,
      adminUser.password
    );
    if (!isValidPassword) {
      return { success: false };
    }

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, adminUser.id));

    // In a real app, you'd generate a JWT token here
    const token = `mock-token-${adminUser.id}`;

    return {
      success: true,
      token,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false };
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
