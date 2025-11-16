import { db } from '@/db/client';
import { chatSessions, chatMessages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { generateChatResponse, type ChatMessage } from './gemini';

export interface ChatSession {
  id: string;
  visitorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

/**
 * Create a new chat session
 * @param visitorId - Optional visitor identifier for tracking
 * @returns The created chat session
 */
export async function createChatSession(
  visitorId?: string
): Promise<ChatSession> {
  try {
    logger.info('Creating new chat session', { visitorId });

    const [session] = await db
      .insert(chatSessions)
      .values({
        visitorId: visitorId || null,
      })
      .returning();

    return session;
  } catch (error) {
    logger.error('Error creating chat session', { error, visitorId });
    throw new Error('Failed to create chat session');
  }
}

/**
 * Get a chat session by ID
 * @param sessionId - The session ID
 * @returns The chat session or null if not found
 */
export async function getChatSession(
  sessionId: string
): Promise<ChatSession | null> {
  try {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    return session || null;
  } catch (error) {
    logger.error('Error getting chat session', { error, sessionId });
    throw new Error('Failed to get chat session');
  }
}

/**
 * Save a chat message
 * @param sessionId - The session ID
 * @param role - The message role (user or assistant)
 * @param content - The message content
 * @returns The saved message
 */
export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessageRecord> {
  try {
    logger.info('Saving chat message', { sessionId, role });

    const [message] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        role,
        content,
      })
      .returning();

    // Update session's updatedAt timestamp
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId));

    return message;
  } catch (error) {
    logger.error('Error saving chat message', { error, sessionId, role });
    throw new Error('Failed to save chat message');
  }
}

/**
 * Get all messages for a chat session
 * @param sessionId - The session ID
 * @param limit - Maximum number of messages to retrieve
 * @returns Array of chat messages
 */
export async function getChatMessages(
  sessionId: string,
  limit = 100
): Promise<ChatMessageRecord[]> {
  try {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);

    // Type assertion to ensure role is correctly typed
    return messages as ChatMessageRecord[];
  } catch (error) {
    logger.error('Error getting chat messages', { error, sessionId });
    throw new Error('Failed to get chat messages');
  }
}

/**
 * Get recent chat sessions
 * @param limit - Maximum number of sessions to retrieve
 * @returns Array of chat sessions
 */
export async function getRecentChatSessions(
  limit = 10
): Promise<ChatSession[]> {
  try {
    const sessions = await db
      .select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.updatedAt))
      .limit(limit);

    return sessions;
  } catch (error) {
    logger.error('Error getting recent chat sessions', { error });
    throw new Error('Failed to get recent chat sessions');
  }
}

/**
 * Process a chat message and generate a response
 * @param sessionId - The session ID
 * @param userMessage - The user's message
 * @returns The assistant's response
 */
export async function processChatMessage(
  sessionId: string,
  userMessage: string
): Promise<string> {
  try {
    logger.info('Processing chat message', { sessionId });

    // Verify session exists
    const session = await getChatSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Save user message
    await saveChatMessage(sessionId, 'user', userMessage);

    // Get conversation history
    const messages = await getChatMessages(sessionId);

    // Convert to ChatMessage format
    const chatHistory: ChatMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate AI response
    const assistantResponse = await generateChatResponse({
      messages: chatHistory,
    });

    // Save assistant response
    await saveChatMessage(sessionId, 'assistant', assistantResponse);

    logger.info('Successfully processed chat message', {
      sessionId,
      responseLength: assistantResponse.length,
    });

    return assistantResponse;
  } catch (error) {
    logger.error('Error processing chat message', { error, sessionId });
    throw new Error(
      `Failed to process chat message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a chat session and all its messages
 * @param sessionId - The session ID
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    logger.info('Deleting chat session', { sessionId });

    // Messages will be deleted automatically due to cascade delete
    await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));

    logger.info('Successfully deleted chat session', { sessionId });
  } catch (error) {
    logger.error('Error deleting chat session', { error, sessionId });
    throw new Error('Failed to delete chat session');
  }
}
