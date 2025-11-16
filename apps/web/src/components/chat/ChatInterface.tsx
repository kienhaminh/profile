'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/trpc/react';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export function ChatInterface() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // Create a new session on component mount
  const createSessionMutation = trpc.chat.createSession.useMutation();

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check if we have a session ID in localStorage
        const storedSessionId = localStorage.getItem('chatSessionId');

        if (storedSessionId) {
          // Verify the session exists and load messages
          try {
            const session = await utils.client.chat.getSession.query({
              sessionId: storedSessionId,
            });
            if (session) {
              setSessionId(storedSessionId);

              // Load messages for this session
              const existingMessages =
                await utils.client.chat.getMessages.query({
                  sessionId: storedSessionId,
                });
              setMessages(existingMessages);
            } else {
              throw new Error('Session not found');
            }
          } catch {
            // Session doesn't exist, create a new one
            localStorage.removeItem('chatSessionId');
            const newSession = await createSessionMutation.mutateAsync({});
            setSessionId(newSession.id);
            localStorage.setItem('chatSessionId', newSession.id);
          }
        } else {
          // Create a new session
          const newSession = await createSessionMutation.mutateAsync({});
          setSessionId(newSession.id);
          localStorage.setItem('chatSessionId', newSession.id);
        }
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
      }
    };

    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!sessionId) {
      console.error('No session ID available');
      return;
    }

    try {
      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send message and get response
      const response = await sendMessageMutation.mutateAsync({
        sessionId,
        message: content,
      });

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: `temp-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.response,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show an error message to the user
    }
  };

  if (!sessionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Initializing chat session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md px-4">
              <h2 className="text-2xl font-bold mb-2">
                Welcome! 👋
              </h2>
              <p className="text-muted-foreground">
                I'm here to answer questions about Kien Ha's background,
                skills, experience, and projects. Feel free to ask me anything!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.createdAt}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isLoading}
        placeholder="Ask me anything about Kien Ha..."
      />
    </div>
  );
}
