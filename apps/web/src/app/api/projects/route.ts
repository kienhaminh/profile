import { NextRequest, NextResponse } from 'next/server';
import { createProject, listProjects } from '@/services/project';
import { createProjectSchema, projectFilterSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = projectFilterSchema.parse({
      page: searchParams.get('page') || '0',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || 'PUBLISHED', // Default to published for public API
      technologyId: searchParams.get('technologyId') || undefined,
      hashtagId: searchParams.get('hashtagId') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const result = await listProjects(filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }
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
    const data = createProjectSchema.parse(body);

    const project = await createProject(data);
    return NextResponse.json(project, { status: 201 });
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
    const causeMsg = String((error.cause && error.cause.message) || '');
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
