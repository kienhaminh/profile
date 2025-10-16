import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectById,
  updateProject,
  deleteProject,
} from '@/services/project';
import { updateProjectSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const project = await getProjectById(id);
    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Project not found') {
      return NextResponse.json(
        { error: 'Not Found', message: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const data = updateProjectSchema.parse(body);

    const { id } = params;
    const project = await updateProject(id, data);
    return NextResponse.json(project, { status: 200 });
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
    if (error.message === 'Project not found') {
      return NextResponse.json(
        { error: 'Not Found', message: error.message },
        { status: 404 }
      );
    }
    if (error.message.includes('already exists')) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = params;
    await deleteProject(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Project not found') {
      return NextResponse.json(
        { error: 'Not Found', message: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
