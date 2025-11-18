import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { KnowledgeExtractionService } from '@/services/knowledge-extraction';

/**
 * POST /api/admin/knowledge/extract
 * Extract knowledge from URL, document, or image
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure admin authentication
    await ensureAdminOrThrow(request);

    const contentType = request.headers.get('content-type') || '';

    // Handle URL extraction (JSON payload)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { url } = body;

      if (!url) {
        return NextResponse.json(
          { error: 'URL is required' },
          { status: 400 }
        );
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }

      // Extract knowledge from URL
      const result = await KnowledgeExtractionService.extractFromUrl(url);

      // Save to database
      const entry = await KnowledgeExtractionService.saveKnowledge({
        title: result.title,
        sourceType: 'url',
        sourceUrl: url,
        extractedData: result.extractedData,
        status: 'completed',
      });

      return NextResponse.json({
        success: true,
        entry,
      });
    }

    // Handle file upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { error: 'File is required' },
          { status: 400 }
        );
      }

      // Determine source type based on MIME type
      const mimeType = file.type;
      let sourceType: 'document' | 'image';
      let result;

      if (mimeType.startsWith('image/')) {
        sourceType = 'image';
        result = await KnowledgeExtractionService.extractFromImage(file);
      } else {
        sourceType = 'document';
        result = await KnowledgeExtractionService.extractFromDocument(file);
      }

      // Save to database
      const entry = await KnowledgeExtractionService.saveKnowledge({
        title: result.title,
        sourceType,
        fileName: result.fileName,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
        extractedData: result.extractedData,
        status: 'completed',
      });

      return NextResponse.json({
        success: true,
        entry,
      });
    }

    return NextResponse.json(
      { error: 'Invalid content type. Use application/json for URLs or multipart/form-data for files' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error extracting knowledge:', error);
    return NextResponse.json(
      { error: 'Failed to extract knowledge' },
      { status: 500 }
    );
  }
}
