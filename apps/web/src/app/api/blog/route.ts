import { NextRequest, NextResponse } from 'next/server';
import { listBlogs, createBlog } from '@/services/blog';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { createBlogSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/auth';
import { ZodError } from 'zod';
import { POST_STATUS } from '@/types/enums';
import type { PostStatus } from '@/types/enums';
import type { CreatePostInput } from '@/types/blog';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // For now, only support status filtering
    // TODO: Add full filter support with pagination
    const statusParam = searchParams.get('status') || POST_STATUS.PUBLISHED;
    const status = statusParam as PostStatus;

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(1, Number(pageParam) || 1) : undefined;
    const limit =
      limitParam && Number(limitParam) > 0 ? Number(limitParam) : undefined;

    const result = await listBlogs(status, { page, limit });
    return NextResponse.json(
      { items: result.data, pagination: result.pagination },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();

    // Make authorId optional for validation since we resolve it automatically
    const schemaWithOptionalAuthorId = createBlogSchema.extend({
      authorId: createBlogSchema.shape.authorId.optional(),
    });

    const parsed = schemaWithOptionalAuthorId.parse(body);

    // Cast status to PostStatus if provided. `authorId` is resolved below, so keep it optional here
    const data: Omit<CreatePostInput, 'authorId'> & {
      authorId?: string;
    } = {
      ...parsed,
      status: parsed.status as PostStatus | undefined,
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
        {
          error: 'Validation Error',
          message: error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', '),
          details: error.issues,
        },
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
