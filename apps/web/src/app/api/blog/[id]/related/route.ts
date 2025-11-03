import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRelatedBlogsById } from '@/services/knowledge-graph';
import { relatedBlogsResponseSchema } from '@/types/graph';
import { logger } from '@/lib/logger';

const paramsSchema = z.object({
  id: z.string().uuid('Invalid blog ID format'),
});

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).optional().default(5),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Parse and validate params
    const resolvedParams = await params;
    const parsedParams = paramsSchema.safeParse(resolvedParams);
    if (!parsedParams.success) {
      logger.warn('Invalid blog ID in related posts request', {
        errors: parsedParams.error.issues,
      });
      return NextResponse.json(
        { error: 'Invalid blog ID format' },
        { status: 400 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const parsedQuery = querySchema.safeParse({
      limit: searchParams.get('limit'),
    });
    if (!parsedQuery.success) {
      logger.warn('Invalid query params in related posts request', {
        errors: parsedQuery.error.issues,
      });
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { id } = parsedParams.data;
    const { limit } = parsedQuery.data;

    // Fetch related blogs
    const relatedBlogs = await getRelatedBlogsById(id, limit);

    // Validate response with zod (expects relatedBlogs + total)
    const response = relatedBlogsResponseSchema.parse({
      relatedBlogs,
      total: relatedBlogs.length,
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    logger.error('Error fetching related blogs', { error });

    return NextResponse.json(
      { error: 'Failed to fetch related blogs' },
      { status: 500 }
    );
  }
}
