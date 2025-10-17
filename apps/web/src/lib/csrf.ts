import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface TokenPayload {
  token: string;
  timestamp: number;
}

function getSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error('CSRF_SECRET environment variable is not set');
  }
  return secret;
}

export function generateCSRFToken(): string {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('base64url');
  const timestamp = Date.now();
  const payload: TokenPayload = { token, timestamp };
  const payloadStr = JSON.stringify(payload);
  const signature = createHmac('sha256', getSecret())
    .update(payloadStr)
    .digest('base64url');
  
  return `${Buffer.from(payloadStr).toString('base64url')}.${signature}`;
}

function verifyCSRFToken(signedToken: string): TokenPayload | null {
  try {
    const [payloadB64, signature] = signedToken.split('.');
    if (!payloadB64 || !signature) return null;

    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const expectedSignature = createHmac('sha256', getSecret())
      .update(payloadStr)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const payload: TokenPayload = JSON.parse(payloadStr);
    
    if (Date.now() - payload.timestamp > TOKEN_EXPIRY) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setCSRFCookie(response: NextResponse): void {
  const token = generateCSRFToken();
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/',
  });
}

export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  const cookiePayload = verifyCSRFToken(cookieToken);
  const headerPayload = verifyCSRFToken(headerToken);

  if (!cookiePayload || !headerPayload) {
    return false;
  }

  return cookiePayload.token === headerPayload.token;
}

export function createCSRFErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Invalid or missing CSRF token' },
    { status: 403 }
  );
}
