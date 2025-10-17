import { NextRequest, NextResponse } from 'next/server';
import { updateTechnology, deleteTechnology } from '@/services/technology';
import { updateTechnologySchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import {
  TechnologyNotFoundError,
  TechnologyConflictError,
} from '@/lib/error-utils';
import { ZodError } from 'zod';


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const data = updateTechnologySchema.parse(body);
    const { id } = await params;
    const technology = await updateTechnology(id, data);
    return NextResponse.json(technology, { status: 200 });
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
    if (error instanceof TechnologyNotFoundError) {
      return NextResponse.json(
        { error: 'Technology Not Found', message: error.message },
        { status: 404 }
      );
    }
    if (error instanceof TechnologyConflictError) {
      return NextResponse.json(
        { error: 'Technology Conflict', message: error.message },
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
    await deleteTechnology(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof TechnologyNotFoundError) {
      return NextResponse.json(
        { error: 'Technology Not Found', message: error.message },
        { status: 404 }
      );
    }
    if (error instanceof TechnologyConflictError) {
      return NextResponse.json(
        { error: 'Technology Conflict', message: error.message },
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
export const runtime = 'nodejs';
