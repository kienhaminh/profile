import { NextRequest, NextResponse } from 'next/server';
import { createTag } from '@/services/tags';
import { createTagInputSchema } from '@/types/tag';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/auth';
import { ZodError } from 'zod';
import { logErrorAndReturnSanitized } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const data = createTagInputSchema.parse(body);
    const topic = await createTag(data);
    return NextResponse.json(topic, { status: 201 });
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

    return logErrorAndReturnSanitized(error, 'topics POST');
  }
}
