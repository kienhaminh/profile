import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken, createCSRFErrorResponse } from '@/lib/csrf';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  if (!validateCSRFToken(request)) {
    logger.warn('CSRF validation failed for logout attempt', {
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
    return createCSRFErrorResponse();
  }

  const response = NextResponse.json({ success: true });

  response.cookies.delete({
    name: 'admin-token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  response.cookies.delete({
    name: 'csrf-token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return response;
}
