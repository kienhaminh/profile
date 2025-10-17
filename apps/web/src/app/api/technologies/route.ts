import { NextResponse } from 'next/server';
import { listTechnologies } from '@/services/technology';

export async function GET() {
  try {
    const technologies = await listTechnologies();
    return NextResponse.json(technologies, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500 }
    );
  }
}
