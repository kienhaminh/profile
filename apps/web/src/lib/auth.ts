import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/errors';
import * as jwt from 'jsonwebtoken';

// Re-export UnauthorizedError for convenience
export { UnauthorizedError };

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface DecodedToken {
  adminId: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token and returns the decoded payload
 */
export function verifyAdminToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Ensures the request has valid admin authentication
 */
export async function ensureAdminOrThrow(request: NextRequest): Promise<void> {
  // First, try to get token from httpOnly cookie (preferred method)
  const cookieToken = request.cookies.get('admin-token')?.value;

  // Fallback to Authorization header for backward compatibility
  const headerAuth = request.headers.get('authorization') || '';
  const headerToken = request.headers.get('x-admin-token');

  const bearerToken = headerAuth.toLowerCase().startsWith('bearer ')
    ? headerAuth.slice(7)
    : '';

  const token = cookieToken || bearerToken || headerToken;
  const configuredToken = process.env.ADMIN_API_TOKEN;

  if (!token) {
    throw new UnauthorizedError('Missing admin token');
  }

  // Allow configured static token for development/testing
  if (configuredToken && token === configuredToken) {
    return; // Valid static token
  }

  // Verify JWT token
  verifyAdminToken(token);
}

/**
 * Extracts admin token from request headers
 */
export function extractAdminTokenFromHeaders(request: NextRequest): string {
  // First, try to get token from httpOnly cookie (preferred method)
  const cookieToken = request.cookies.get('admin-token')?.value;

  // Fallback to Authorization header for backward compatibility
  const headerAuth = request.headers.get('authorization') || '';
  const headerToken = request.headers.get('x-admin-token');

  const bearerToken = headerAuth.toLowerCase().startsWith('bearer ')
    ? headerAuth.slice(7)
    : '';

  const token = cookieToken || bearerToken || headerToken;

  if (!token) {
    throw new UnauthorizedError('Missing admin token');
  }

  return token;
}

// Client-side auth utilities for making authenticated requests

/**
 * Makes an authenticated GET request
 */
export async function authFetch(url: string): Promise<Response> {
  return fetch(url, {
    method: 'GET',
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Makes an authenticated POST request
 */
export async function authPost(url: string, data: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Makes an authenticated PUT request
 */
export async function authPut(url: string, data: unknown): Promise<Response> {
  return fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Makes an authenticated DELETE request
 */
export async function authDelete(url: string): Promise<Response> {
  return fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
