'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalLine {
  type: 'command' | 'output';
  content: string;
  delay?: number;
}

const lines: TerminalLine[] = [
  { type: 'command', content: 'whoami', delay: 500 },
  { type: 'output', content: 'kien_ha', delay: 1000 },
  { type: 'command', content: 'cat role.txt', delay: 1500 },
  {
    type: 'output',
    content: 'AI Researcher & Full-stack Developer',
    delay: 2000,
  },
  { type: 'command', content: 'ls skills/', delay: 2500 },
  {
    type: 'output',
    content: 'React  Next.js  TypeScript  PyTorch  TensorFlow  Medical_AI',
    delay: 3000,
  },
  { type: 'command', content: './start_portfolio.sh', delay: 4000 },
  { type: 'output', content: 'Initializing cosmic theme...', delay: 4500 },
  { type: 'output', content: 'Loading projects...', delay: 4800 },
  { type: 'output', content: 'Ready!', delay: 5100 },
];

export function Terminal({ className }: { className?: string }) {
  const [displayedLines, setDisplayedLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const line = lines[currentLineIndex];

    if (line.type === 'command') {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= line.content.length) {
          setCurrentText(line.content.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setDisplayedLines((prev) => [...prev, line]);
            setCurrentText('');
            setCurrentLineIndex((prev) => prev + 1);
          }, 300);
        }
      }, 50); // Typing speed

      return () => clearInterval(typeInterval);
    } else {
      // Output appears instantly after delay
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, line]);
        setCurrentLineIndex((prev) => prev + 1);
      }, 500); // Delay before showing output

      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLines, currentText]);

  return (
    <div
      className={cn(
        'w-full max-w-2xl mx-auto rounded-lg overflow-hidden border border-border/50 bg-[#1e1e1e]/90 backdrop-blur-md shadow-2xl font-mono text-sm md:text-base',
        className
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center text-muted-foreground text-xs">
          <TerminalIcon className="w-3 h-3 mr-2" />
          bash — 80x24
        </div>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="p-4 h-[300px] overflow-y-auto text-gray-300 space-y-2 scrollbar-hide"
      >
        {displayedLines.map((line, idx) => (
          <div
            key={idx}
            className={`${line.type === 'command' ? 'text-blue-400' : 'text-green-400'}`}
          >
            {line.type === 'command' && (
              <span className="text-pink-500 mr-2">$</span>
            )}
            {line.content}
          </div>
        ))}

        {/* Current typing line */}
        {currentLineIndex < lines.length &&
          lines[currentLineIndex].type === 'command' && (
            <div className="text-blue-400">
              <span className="text-pink-500 mr-2">$</span>
              {currentText}
              <span className="animate-pulse inline-block w-2 h-4 bg-gray-400 ml-1 align-middle" />
            </div>
          )}

        {/* Cursor when waiting */}
        {currentLineIndex < lines.length &&
          lines[currentLineIndex].type !== 'command' && (
            <div className="animate-pulse inline-block w-2 h-4 bg-gray-400" />
          )}

        {/* Final cursor */}
        {currentLineIndex >= lines.length && (
          <div className="text-blue-400">
            <span className="text-pink-500 mr-2">$</span>
            <span className="animate-pulse inline-block w-2 h-4 bg-gray-400 ml-1 align-middle" />
          </div>
        )}
      </div>
    </div>
  );
}
