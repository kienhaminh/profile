import { GoogleGenAI } from '@google/genai';
import { logger } from '@/lib/logger';
import { getAIContext } from '@/config/knowledge-base';

// Get Gemini AI client
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    logger.error('GOOGLE_API_KEY environment variable is not set');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export interface BlogPromptInput {
  prompt: string;
  topic?: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'technical' | 'conversational';
  length?: 'short' | 'medium' | 'long';
}

export interface GeneratedBlogContent {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  readTime?: number;
  seoTitle?: string;
  metaDescription?: string;
}

const PROMPT_TEMPLATE = `You are a professional blog content writer. Generate a comprehensive blog post based on the following requirements:

LANGUAGE: Write ALL content in Vietnamese (Tiếng Việt). This includes the title, excerpt, content, SEO title, and meta description.

PROMPT: {prompt}
{topicInfo}
{audienceInfo}
{toneInfo}
{lengthInfo}

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any explanatory text, markdown formatting, code blocks, or backticks. Do not wrap the response in \`\`\`json or any other markdown syntax. Start your response directly with { and end with }. Return pure JSON only.

Generate the blog post with the following structure as a JSON object:
{
  "title": "A compelling, SEO-friendly title in Vietnamese (max 80 characters)",
  "excerpt": "A brief summary in Vietnamese (2-3 sentences, max 160 characters)",
  "content": "The full blog post content in Vietnamese, in HTML format with proper headings, paragraphs, and lists",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": 5,
  "seoTitle": "SEO-optimized title in Vietnamese (max 60 characters)",
  "metaDescription": "Meta description in Vietnamese for SEO (max 160 characters)"
}

Ensure the content is:
- Written entirely in Vietnamese
- Well-structured with proper HTML formatting
- Engaging and informative
- Original and valuable to readers
- Properly formatted for web display

Response must be valid JSON only.`;

/**
 * Extracts JSON from text that might be wrapped in markdown code blocks
 * Handles formats like: ```json {...} ``` or ``` {...} ```
 */
function extractJsonFromText(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code blocks
  // Match ```json or ``` followed by content and closing ```
  // Using [\s\S] instead of . with s flag for better compatibility
  const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/;
  const match = cleaned.match(codeBlockRegex);

  if (match) {
    cleaned = match[1].trim();
  } else {
    // Also try removing just the opening/closing markers if they exist separately
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/g, '')
      .replace(/\n?```\s*$/g, '');
  }

  return cleaned.trim();
}

function buildPrompt(input: BlogPromptInput): string {
  const parts = [];

  if (input.topic) {
    parts.push(`TOPIC: ${input.topic}`);
  }

  if (input.targetAudience) {
    parts.push(`TARGET_AUDIENCE: ${input.targetAudience}`);
  }

  if (input.tone) {
    parts.push(`TONE: ${input.tone}`);
  }

  if (input.length) {
    const lengthGuidelines = {
      short: '800-1200 words, concise and focused',
      medium: '1500-2500 words, comprehensive coverage',
      long: '3000+ words, in-depth analysis and multiple perspectives',
    };
    parts.push(`LENGTH: ${lengthGuidelines[input.length]}`);
  }

  return PROMPT_TEMPLATE.replace('{prompt}', input.prompt)
    .replace('{topicInfo}', parts.find((p) => p.startsWith('TOPIC:')) || '')
    .replace(
      '{audienceInfo}',
      parts.find((p) => p.startsWith('TARGET_AUDIENCE:')) || ''
    )
    .replace('{toneInfo}', parts.find((p) => p.startsWith('TONE:')) || '')
    .replace('{lengthInfo}', parts.find((p) => p.startsWith('LENGTH:')) || '');
}

export async function generateBlogFromPrompt(
  input: BlogPromptInput
): Promise<GeneratedBlogContent> {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY environment variable is required');
  }

  try {
    logger.info('Generating blog content from prompt', {
      promptLength: input.prompt.length,
      topic: input.topic,
      targetAudience: input.targetAudience,
      tone: input.tone,
      length: input.length,
    });

    const prompt = buildPrompt(input);

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });
    const text = result.text;

    // Check if response contains error information
    if (!text || text.trim() === '') {
      throw new Error('Empty response from Gemini API');
    }

    // Parse the JSON response
    let generatedContent: GeneratedBlogContent;
    try {
      // Extract JSON from markdown code blocks if present
      const cleanedText = extractJsonFromText(text);
      generatedContent = JSON.parse(cleanedText) as GeneratedBlogContent;
    } catch (parseError) {
      logger.error('Failed to parse Gemini API response as JSON', {
        text: text.substring(0, 200),
        parseError,
      });
      throw new Error(
        `Invalid response format from Gemini API: ${text.substring(0, 100)}...`
      );
    }

    // Validate the response structure
    if (!generatedContent.title || !generatedContent.content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    // Ensure tags is an array
    if (typeof generatedContent.tags === 'string') {
      generatedContent.tags = (generatedContent.tags as string)
        .split(',')
        .map((tag) => tag.trim());
    }

    logger.info('Successfully generated blog content', {
      title: generatedContent.title,
      contentLength: generatedContent.content.length,
      tagsCount: generatedContent.tags?.length || 0,
    });

    return generatedContent;
  } catch (error) {
    logger.error('Error generating blog from prompt', { error, input });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate blog content from prompt');
  }
}

export async function generateTitleFromPrompt(prompt: string): Promise<string> {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY environment variable is required');
  }

  try {
    const titlePrompt = `Generate a compelling, SEO-friendly blog post title in Vietnamese (Tiếng Việt) based on this prompt: "${prompt}". The title should be under 80 characters and engaging. Return only the title in Vietnamese, nothing else.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: titlePrompt,
    });

    if (!result.text) {
      throw new Error('Empty response from Gemini API');
    }

    const title = result.text.trim();

    return title;
  } catch (error) {
    logger.error('Error generating title from prompt', { error, prompt });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate title from prompt');
  }
}

export async function generateExcerptFromPrompt(
  prompt: string
): Promise<string> {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY environment variable is required');
  }

  try {
    const excerptPrompt = `Generate a brief, compelling excerpt in Vietnamese (Tiếng Việt) (2-3 sentences, max 160 characters) for a blog post based on this prompt: "${prompt}". Return only the excerpt in Vietnamese, nothing else.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: excerptPrompt,
    });

    if (!result.text) {
      throw new Error('Empty response from Gemini API');
    }

    const excerpt = result.text.trim();

    return excerpt;
  } catch (error) {
    logger.error('Error generating excerpt from prompt', { error, prompt });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate excerpt from prompt');
  }
}

// ==================== CHAT FUNCTIONALITY ====================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate a chat response using Gemini AI
 * @param options - Chat completion options including message history
 * @returns The AI-generated response
 */
export async function generateChatResponse(
  options: ChatCompletionOptions
): Promise<string> {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY environment variable is required');
  }

  try {
    logger.info('Generating chat response', {
      messageCount: options.messages.length,
    });

    // Get the AI context from knowledge base
    const systemContext = getAIContext();

    // Format the conversation history
    const conversationHistory = options.messages
      .map((msg) => {
        const prefix = msg.role === 'user' ? 'User' : 'Assistant';
        return `${prefix}: ${msg.content}`;
      })
      .join('\n\n');

    // Combine system context with conversation history
    const fullPrompt = `${systemContext}

CONVERSATION HISTORY:
${conversationHistory}

Please respond to the latest user message naturally and helpfully, staying in character as an assistant representing the person described above. Keep responses concise but informative.`;

    // Generate response
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: fullPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024,
      },
    });

    const text = result.text;

    if (!text) {
      throw new Error('Empty response from Gemini AI');
    }

    logger.info('Successfully generated chat response', {
      responseLength: text.length,
    });

    return text.trim();
  } catch (error) {
    logger.error('Error generating chat response', { error });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate chat response');
  }
}

/**
 * Stream a chat response using Gemini AI (for real-time streaming)
 * @param options - Chat completion options
 * @returns An async generator that yields response chunks
 */
export async function* streamChatResponse(
  options: ChatCompletionOptions
): AsyncGenerator<string> {
  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY environment variable is required');
  }

  try {
    logger.info('Starting chat response stream', {
      messageCount: options.messages.length,
    });

    const systemContext = getAIContext();
    const conversationHistory = options.messages
      .map((msg) => {
        const prefix = msg.role === 'user' ? 'User' : 'Assistant';
        return `${prefix}: ${msg.content}`;
      })
      .join('\n\n');

    const fullPrompt = `${systemContext}

CONVERSATION HISTORY:
${conversationHistory}

Please respond to the latest user message naturally and helpfully, staying in character as an assistant representing the person described above. Keep responses concise but informative.`;

    // Generate streaming response
    const result = await genAI.models.generateContentStream({
      model: 'gemini-2.0-flash-001',
      contents: fullPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024,
      },
    });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }

    logger.info('Successfully completed chat response stream');
  } catch (error) {
    logger.error('Error streaming chat response', { error });
    throw new Error(
      `Failed to stream response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate that Gemini API is properly configured
 */
export function validateGeminiConfig(): boolean {
  return !!process.env.GOOGLE_API_KEY;
}
