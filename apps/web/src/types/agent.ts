import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content cannot be empty'),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const agentInputSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long'),
  conversationHistory: z.array(chatMessageSchema).optional().default([]),
});

export type AgentInput = z.infer<typeof agentInputSchema>;

export interface AgentResponse {
  text: string;
}

