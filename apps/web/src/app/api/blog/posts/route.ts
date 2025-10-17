import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/services/posts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    // parse and sanitize query parameters
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '10', 10) || 10)
    );
    const offset = Math.max(
      0,
      parseInt(searchParams.get('offset') || '0', 10) || 0
    );

    const posts = await getPosts({
      status: 'published', // Only published posts for public API
      topic: topic || undefined,
      limit,
      offset,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
