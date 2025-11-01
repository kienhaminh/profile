import { NextResponse } from 'next/server';
import { getAllTags } from '@/services/tags';

export async function GET() {
  try {
    const hashtags = await getAllTags();
    return NextResponse.json(hashtags, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch hashtags' },
      { status: 500 }
    );
  }
}
