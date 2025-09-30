import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/services/auth';
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 5 login attempts per 15 minutes
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimit(identifier, {
      interval: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    });

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded for login attempt', {
        identifier,
        resetTime: new Date(rateLimitResult.resetTime).toISOString(),
      });
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await authenticateUser({ username, password });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    logger.error(
      'Login error',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
