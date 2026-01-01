import { NextResponse } from 'next/server';
import { getAllTags } from '@/services/tags';

export async function GET() {
  try {
    const topics = await getAllTags();
    return NextResponse.json(topics, { status: 200 });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
