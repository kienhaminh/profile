import { NextRequest, NextResponse } from 'next/server';
import { getTagById, updateTag, deleteTag } from '@/services/tags';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const tag = await getTagById(id);

    return NextResponse.json(tag);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    logger.error('Error in GET /api/tags/[id]', { error });
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const tag = await updateTag(id, body);

    return NextResponse.json(tag);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    logger.error('Error in PATCH /api/tags/[id]', { error });
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    await deleteTag(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    logger.error('Error in DELETE /api/tags/[id]', { error });
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
