import { NextRequest, NextResponse } from 'next/server';
import { createProject } from '@/services/project';
import { createProjectSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await createProject(data);
    return NextResponse.json(project, { status: 201 });
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
    const msg = String(errorMessage || '');
    const causeMsg =
      error instanceof Error &&
      error.cause &&
      typeof error.cause === 'object' &&
      'message' in error.cause
        ? String(error.cause.message)
        : '';
    const causeCode =
      error instanceof Error &&
      error.cause &&
      typeof error.cause === 'object' &&
      'code' in error.cause
        ? String(error.cause.code)
        : '';
    if (
      msg.includes('already exists') ||
      /duplicate key value|unique constraint/i.test(msg) ||
      /duplicate key value|unique constraint/i.test(causeMsg) ||
      causeCode === '23505'
    ) {
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
