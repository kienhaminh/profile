import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/services/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
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

    // Audit log for successful admin login
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    logger.info('Admin login successful', {
      adminUser: username,
      ipAddress: clientIP,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    // Set HTTP-only cookie for server-side authentication
    if (result.token) {
      response.cookies.set('admin-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    logger.error('Login error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
