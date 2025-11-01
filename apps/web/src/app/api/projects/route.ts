import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects } from '@/services/projects';
import { ZodError } from 'zod';
import { PROJECT_STATUS } from '@/types/enums';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // For now, only support status filtering
    // TODO: Add full filter support with pagination
    const statusParam = searchParams.get('status') || PROJECT_STATUS.PUBLISHED;
    const status = statusParam as import('@/types/enums').ProjectStatus;

    const result = await getAllProjects(status);
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
