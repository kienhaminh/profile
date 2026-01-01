import { NextRequest, NextResponse } from 'next/server';
import { getSeriesBySlug } from '@/services/series';
import { NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { POST_STATUS } from '@/types/enums';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Only return published posts for public endpoint
    const series = await getSeriesBySlug(slug, false);

    // Filter to only include published series
    if (series.status !== POST_STATUS.PUBLISHED) {
      throw new NotFoundError(`Series not found: ${slug}`);
    }

    return NextResponse.json(series, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    logger.error('Error in GET /api/blog/series/[slug]', { error });
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}
