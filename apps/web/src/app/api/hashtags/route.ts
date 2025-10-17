import { NextResponse } from 'next/server';
import { listHashtags } from '@/services/hashtag';

export async function GET() {
  try {
    const hashtags = await listHashtags();
    return NextResponse.json(hashtags, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch hashtags' },
      { status: 500 }
    );
  }
}
