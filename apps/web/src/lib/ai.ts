import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy', // Allow build to pass without key, but runtime will fail if needed
});

export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generation failed:', error);

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not defined, cannot fallback.');
      throw error;
    }

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o',
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI returned empty response');
      }
      return content;
    } catch (openaiError) {
      console.error('OpenAI fallback failed:', openaiError);
      // Throw the original error to preserve the primary failure context,
      // or throw a new error indicating both failed.
      throw new Error(
        `Both AI models failed. Gemini: ${error instanceof Error ? error.message : String(error)}. OpenAI: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`
      );
    }
  }
}
