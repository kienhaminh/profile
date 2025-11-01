import { NextRequest, NextResponse } from 'next/server';
import { listBlogs } from '@/services/blog';
import { ZodError } from 'zod';
import { POST_STATUS } from '@/types/enums';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // For now, only support status filtering
    // TODO: Add full filter support with pagination
    const statusParam = searchParams.get('status') || POST_STATUS.PUBLISHED;
    const status = statusParam as import('@/types/enums').PostStatus;

    const result = await listBlogs(status);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500 }
    );
  }
}
