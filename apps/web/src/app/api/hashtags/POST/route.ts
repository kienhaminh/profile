import { NextRequest, NextResponse } from 'next/server';
import { createTag } from '@/services/tags';
import { ConflictError } from '@/lib/errors';
import { createTagInputSchema } from '@/types/tag';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const data = createTagInputSchema.parse(body);

    const hashtag = await createTag(data);
    return NextResponse.json(hashtag, { status: 201 });
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
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Hashtag already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
