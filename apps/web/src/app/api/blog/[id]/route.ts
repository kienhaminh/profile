import { NextRequest, NextResponse } from 'next/server';
import { getBlogById, updateBlog, deleteBlog } from '@/services/blog';
import { updateBlogSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await getBlogById(id);
    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    if (errorMessage === 'Blog post not found') {
      return NextResponse.json(
        { error: 'Not Found', message: errorMessage },
        { status: 404 }
      );
    }
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
    const data = updateBlogSchema.parse(body);
    const { id } = await params;

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
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    if (errorMessage === 'Blog post not found') {
      return NextResponse.json(
        { error: 'Not Found', message: errorMessage },
        { status: 404 }
      );
    }
    if (errorMessage.includes('already exists')) {
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
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    if (errorMessage === 'Blog post not found') {
      return NextResponse.json(
        { error: 'Not Found', message: errorMessage },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500 }
    );
  }
}
