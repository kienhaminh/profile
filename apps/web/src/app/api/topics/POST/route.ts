import { NextRequest, NextResponse } from 'next/server';
import { createTopic } from '@/services/topics';
import { createTopicSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';
import { logErrorAndReturnSanitized } from '@/lib/error-utils';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const data = createTopicSchema.parse(body);
    const topic = await createTopic(data);
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

    const { status, body } = logErrorAndReturnSanitized(
      error,
      'topics POST',
      'Conflict creating topic',
      'An unexpected error occurred'
    );

    return NextResponse.json(body, { status });
  }
}
