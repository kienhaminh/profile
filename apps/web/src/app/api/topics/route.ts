import { NextResponse } from 'next/server';
import { listTopics } from '@/services/topics';

export async function GET() {
  try {
    const topics = await listTopics();
    return NextResponse.json(topics, { status: 200 });
  } catch (error) {
    console.error('Failed to list topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
