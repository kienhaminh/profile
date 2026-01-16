import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sign as jwtSign, type SignOptions } from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import * as bcrypt from 'bcryptjs';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || '24h';

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
  };
}

/**
 * Authenticates a user with username and password
 */
export async function authenticateUser(credentials: {
  username: string;
  password: string;
}): Promise<AuthResult> {
  const { username, password } = credentials;
  try {
    // Find user by username
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (result.length === 0) {
      return { success: false };
    }

    const user = result[0];

    // Compare hashed password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return { success: false };
    }

    // Generate JWT token
    const token = jwtSign(
      {
        adminId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION } as SignOptions
    );

    logger.info('User authenticated successfully', { username });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  } catch (error) {
    logger.error('Error authenticating user', { error, username });
    return { success: false };
  }
}

/**
 * Retrieves a user by their ID
 */
export async function getUserById(id: string) {
  try {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error('Error fetching user by ID', { error, userId: id });
    return null;
  }
}
