import { NextResponse } from 'next/server';
import { getAllPosts } from '@/services/posts';
import { POST_STATUS } from '@/types/enums';

export async function GET() {
  try {
    // Only return published posts for public API
    // TODO: Add pagination and topic filtering when needed
    const posts = await getAllPosts(POST_STATUS.PUBLISHED);

    return NextResponse.json({
      items: posts.data,
      pagination: posts.pagination,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
