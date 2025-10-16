import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Define protected API routes that require authentication for mutations
  const protectedRoutes = [
    '/api/blog',
    '/api/projects',
    '/api/hashtags',
    '/api/topics',
    '/api/technologies',
  ];

  // Check if the request is to a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Only protect mutation operations (POST, PUT, DELETE)
  const isMutationMethod = ['POST', 'PUT', 'DELETE'].includes(method);

  if (isProtectedRoute && isMutationMethod) {
    try {
      // Create a new request with token from cookie if not in header
      const token = request.cookies.get('admin-token')?.value;
      if (token && !request.headers.get('authorization') && !request.headers.get('x-admin-token')) {
        const newHeaders = new Headers(request.headers);
        newHeaders.set('x-admin-token', token);
        const modifiedRequest = new NextRequest(request.url, {
          headers: newHeaders,
          method: request.method,
        });
        await ensureAdminOrThrow(modifiedRequest);
      } else {
        await ensureAdminOrThrow(request);
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
