import { NextRequest, NextResponse } from 'next/server';
import {
  generateBlogFromPrompt,
  generateTitleFromPrompt,
  generateExcerptFromPrompt,
  type BlogPromptInput,
} from '@/services/gemini';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/auth';
import { ZodError } from 'zod';
import { z } from 'zod';

const generateBlogSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long'),
  topic: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z
    .enum(['professional', 'casual', 'technical', 'conversational'])
    .optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid Request',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Validate input
    const validatedInput = generateBlogSchema.parse(body) as BlogPromptInput;

    // Generate blog content using Gemini
    const generatedContent = await generateBlogFromPrompt(validatedInput);

    return NextResponse.json(
      {
        success: true,
        data: generatedContent,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', '),
        },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';

    // Check for specific Gemini API errors
    if (errorMessage.includes('GOOGLE_API_KEY')) {
      return NextResponse.json(
        {
          error: 'Configuration Error',
          message: 'AI service is not properly configured',
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          message: 'AI service quota exceeded. Please try again later.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500 }
    );
  }
}

// Endpoint for generating just a title
export async function PATCH(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid Request',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    const titleSchema = z.object({
      prompt: z.string().min(5, 'Prompt must be at least 5 characters long'),
    });

    const { prompt } = titleSchema.parse(body);

    const title = await generateTitleFromPrompt(prompt);

    return NextResponse.json(
      {
        success: true,
        data: { title },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', '),
        },
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

export const runtime = 'nodejs';
