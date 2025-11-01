import { NextRequest, NextResponse } from 'next/server';
import { createBlog } from '@/services/blog';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { createBlogSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const parsed = createBlogSchema.parse(body);

    // Cast status to PostStatus if provided
    const data: import('@/types/blog').CreatePostInput = {
      ...parsed,
      status: parsed.status as import('@/types/enums').PostStatus | undefined,
    };

    // In tests or when not provided, use the first user
    // Resolve authorId: use provided one, else find first user
    let authorId = data.authorId || '';
    if (!authorId) {
      const existing = await db.select().from(users).limit(1);

      if (existing.length > 0) {
        authorId = existing[0].id;
      } else {
        throw new Error('No users found. Please create a user first.');
      }
    }
    const blog = await createBlog(data, authorId);
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';

    // Check for PostgreSQL unique constraint violation (error code 23505)
    const isUniqueConstraintViolation =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505';

    if (isUniqueConstraintViolation) {
      return NextResponse.json(
        { error: 'Conflict', message: errorMessage },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
