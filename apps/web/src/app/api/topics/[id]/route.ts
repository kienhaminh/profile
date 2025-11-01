import { NextRequest, NextResponse } from 'next/server';
import { updateTag, deleteTag } from '@/services/tags';
import { updateTagInputSchema } from '@/types/tag';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/auth';
import { ZodError } from 'zod';


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const data = updateTagInputSchema.parse(body);
    const { id } = await params;
    const topic = await updateTag(id, data);
    return NextResponse.json(topic, { status: 200 });
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
    await deleteTag(id);
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
