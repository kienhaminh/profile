import { ChatInterface } from '@/components/chat/ChatInterface';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat with Kien Ha | Portfolio Chat Assistant',
  description:
    'Chat with an AI assistant to learn more about Kien Ha\'s skills, experience, and projects.',
};

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chat with Kien Ha</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ask me anything about my background, skills, and projects
              </p>
            </div>
            <a
              href="https://kienha.online"
              className="text-sm text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Portfolio →
            </a>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="container mx-auto px-4 h-[calc(100vh-120px)]">
        <div className="h-full max-w-4xl mx-auto py-4">
          <div className="h-full rounded-lg border bg-card shadow-sm overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-muted-foreground">
            Powered by Gemini AI • Data may not always be accurate
          </p>
        </div>
      </footer>
    </div>
  );
}
