import { NextRequest, NextResponse } from 'next/server';
import { createTechnology, listTechnologies } from '@/services/technology';
import { createTechnologySchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const technologies = await listTechnologies();
    return NextResponse.json(technologies, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
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
    const data = createTechnologySchema.parse(body);

    const technology = await createTechnology(data);
    return NextResponse.json(technology, { status: 201 });
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
    const msg = String(errorMessage || '');
    const causeMsg = error instanceof Error && error.cause && typeof error.cause === 'object' && 'message' in error.cause ? String(error.cause.message) : '';
    const causeCode = error instanceof Error && error.cause && typeof error.cause === 'object' && 'code' in error.cause ? String(error.cause.code) : '';
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    if (
      msg.includes('already exists') ||
      /duplicate key value|unique constraint/i.test(msg) ||
      /duplicate key value|unique constraint/i.test(causeMsg) ||
      causeCode === '23505' ||
      code === '23505'
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
