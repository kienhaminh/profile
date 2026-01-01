import { NextRequest, NextResponse } from 'next/server';
import { getSeriesById, updateSeries, deleteSeries } from '@/services/series';
import { ensureAdminOrThrow } from '@/lib/auth';
import { updateSeriesInputSchema, UpdateSeriesInput } from '@/types/series';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;

    const series = await getSeriesById(id);
    return NextResponse.json(series, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    logger.error('Error in GET /api/admin/series/[id]', { error });
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;

    const body = await request.json();
    const validated = updateSeriesInputSchema.parse(body) as UpdateSeriesInput;
    const series = await updateSeries(id, validated);

    return NextResponse.json(series, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    logger.error('Error in PUT /api/admin/series/[id]', { error });
    return NextResponse.json(
      { error: 'Failed to update series' },
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

    await deleteSeries(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    logger.error('Error in DELETE /api/admin/series/[id]', { error });
    return NextResponse.json(
      { error: 'Failed to delete series' },
      { status: 500 }
    );
  }
}
