import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generates a random CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Sets a CSRF token cookie in the response
 */
export function setCSRFCookie(response: NextResponse, token?: string): void {
  const csrfToken = token || generateCSRFToken();

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Validates CSRF token from request
 */
export function validateCSRFToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }

  return cookieToken === headerToken;
}

/**
 * Validates CSRF token from NextRequest
 */
export function validateCSRFFromRequest(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get('x-csrf-token') || undefined;
  return validateCSRFToken(cookieToken, headerToken);
}

/**
 * Creates a standard CSRF error response
 */
export function createCSRFErrorResponse(): NextResponse {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
}
