'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatInterface } from './ChatInterface';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out transform origin-bottom-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        )}
      >
        <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-2xl border-primary/20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-semibold text-sm">Chat with AI</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-primary/10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </Card>
      </div>

      {/* Toggle Button */}
      <Button
        size="lg"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-110',
          isOpen
            ? 'rotate-90 bg-muted text-muted-foreground hover:bg-muted/90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
