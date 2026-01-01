import { NextRequest, NextResponse } from 'next/server';
import { getAllSeries, createSeries } from '@/services/series';
import { ensureAdminOrThrow } from '@/lib/auth';
import { createSeriesInputSchema, CreateSeriesInput } from '@/types/series';
import { ConflictError } from '@/lib/errors';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    const series = await getAllSeries();
    return NextResponse.json(series, { status: 200 });
  } catch (error) {
    logger.error('Error in GET /api/admin/series', { error });
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    const body = await request.json();
    const validated = createSeriesInputSchema.parse(body) as CreateSeriesInput;
    const series = await createSeries(validated);

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    logger.error('Error in POST /api/admin/series', { error });
    return NextResponse.json(
      { error: 'Failed to create series' },
      { status: 500 }
    );
  }
}
