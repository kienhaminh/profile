import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/services/gemini';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const { title, keywords, summary } = await req.json();

    if (!title || !keywords) {
      return NextResponse.json(
        { error: 'Title and keywords are required' },
        { status: 400 }
      );
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const prompt = `
      You are an expert SEO specialist. Generate an optimized Meta Title and Meta Description based on the following input:
      
      Page Title/Topic: ${title}
      Target Keywords: ${keywords}
      Content Summary: ${summary || 'N/A'}
      
      Requirements:
      1. Meta Title: 50-60 characters, catchy, includes main keyword.
      2. Meta Description: 150-160 characters, compelling, includes keywords naturally.
      3. Output format: JSON object with keys "title" and "description".
      
      Respond ONLY with the JSON object.
    `;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });

    const text = result.text;
    if (!text) {
      throw new Error('Empty response from AI');
    }

    // Clean up markdown code blocks if present
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanText);
    } catch (e) {
      logger.error('Failed to parse AI response', { text });
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    logger.error('Error in SEO generator API', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
