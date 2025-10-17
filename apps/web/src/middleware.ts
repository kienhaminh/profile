import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';

export const runtime = 'nodejs';

// Protected API routes that require authentication for mutations
const PROTECTED_ROUTES = [
  '/api/blog',
  '/api/projects',
  '/api/hashtags',
  '/api/topics',
  '/api/technologies',
] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Use the shared protected routes constant
  const protectedRoutes = [...PROTECTED_ROUTES];

  // Check if the request is to a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Only protect mutation operations (POST, PUT, DELETE)
  const isMutationMethod = ['POST', 'PUT', 'DELETE'].includes(method);

  if (isProtectedRoute && isMutationMethod) {
    try {
      // First authenticate using the original request
      await ensureAdminOrThrow(request);

      // Create a new request with token from cookie if not in header
      const token = request.cookies.get('admin-token')?.value;
      if (
        token &&
        !request.headers.get('authorization') &&
        !request.headers.get('x-admin-token')
      ) {
        const newHeaders = new Headers(request.headers);
        newHeaders.set('x-admin-token', token);
        return NextResponse.next({ request: { headers: newHeaders } });
      }

      return NextResponse.next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          { error: 'Unauthorized', message: error.message },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication failed' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/blog/:path*',
    '/api/projects/:path*',
    '/api/hashtags/:path*',
    '/api/topics/:path*',
    '/api/technologies/:path*',
  ],
};
