import { NextRequest, NextResponse } from 'next/server';
import { updateTag, deleteTag } from '@/services/tags';
import { updateTagInputSchema } from '@/types/tag';
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

    const hashtag = await updateTag(id, data);
    return NextResponse.json(hashtag, { status: 200 });
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
    if (errorMessage === 'Hashtag not found') {
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
    await deleteTag(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    if (errorMessage === 'Hashtag not found') {
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
