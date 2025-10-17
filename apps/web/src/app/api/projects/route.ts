import { NextRequest, NextResponse } from 'next/server';
import { listProjects } from '@/services/project';
import { projectFilterSchema } from '@/lib/validation';
import { ZodError } from 'zod';

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
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.issues },
        { status: 400 }
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
