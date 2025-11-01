import { NextRequest, NextResponse } from 'next/server';
import {
  getBlogById,
  updateBlog,
  deleteBlog,
  NotFoundError,
  ConflictError,
} from '@/services/blog';
import { updateBlogSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/auth';
import { ZodError } from 'zod';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await getBlogById(id);
    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: 'Not Found', message: error.message },
        { status: 404 }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const parsed = updateBlogSchema.parse(body);
    const { id } = await params;

    // Cast status to PostStatus if provided
    const data: import('@/types/blog').UpdatePostInput = {
      ...parsed,
      status: parsed.status as import('@/types/enums').PostStatus | undefined,
    };

    const blog = await updateBlog(id, data);
    return NextResponse.json(blog, { status: 200 });
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
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: 'Not Found', message: error.message },
        { status: 404 }
      );
    }
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: 'Conflict', message: error.message },
        { status: 409 }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;
    await deleteBlog(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: 'Not Found', message: error.message },
        { status: 404 }
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
