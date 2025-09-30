import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/services/posts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await getPosts({
      status: 'PUBLISHED', // Only published posts for public API
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
