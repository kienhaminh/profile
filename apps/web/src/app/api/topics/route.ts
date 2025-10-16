import { NextRequest, NextResponse } from 'next/server';
import { createTopic, listTopics } from '@/services/topics';
import { createTopicSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const topics = await listTopics();
    return NextResponse.json(topics, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const data = createTopicSchema.parse(body);

    const topic = await createTopic(data);
    return NextResponse.json(topic, { status: 201 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }
    const msg = String(error.message || '');
    const causeMsg = String(
      (error.cause && (error.cause as any).message) || ''
    );
    const causeCode = (error.cause && (error.cause as any).code) || '';
    if (
      msg.includes('already exists') ||
      /duplicate key value|unique constraint/i.test(msg) ||
      /duplicate key value|unique constraint/i.test(causeMsg) ||
      causeCode === '23505'
    ) {
      return NextResponse.json(
        { error: 'Conflict', message: error.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
