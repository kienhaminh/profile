'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCw, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  language: string;
  partOfSpeech: string | null;
  example: string | null;
  pronunciation: string | null;
}

interface FlashcardViewProps {
  data: Vocabulary[];
}

export function FlashcardView({ data }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No vocabulary to review. Add some words first!
      </div>
    );
  }

  const currentCard = data[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  function speak(e: React.MouseEvent, text: string, lang: string) {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      lang === 'en' ? 'en-US' : lang === 'ko' ? 'ko-KR' : 'zh-CN';
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
      <div className="relative w-full max-w-md aspect-[3/2] perspective-1000">
        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          onClick={handleFlip}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center border-2 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-4">
              <h2 className="text-4xl font-bold">{currentCard.word}</h2>
              {currentCard.pronunciation && (
                <p className="text-muted-foreground">
                  {currentCard.pronunciation}
                </p>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="mt-2"
                onClick={(e) =>
                  speak(e, currentCard.word, currentCard.language)
                }
              >
                <Volume2 className="h-6 w-6" />
              </Button>
              <p className="text-sm text-muted-foreground mt-8">
                Click to flip
              </p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center border-2 bg-muted/50"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <CardContent className="flex flex-col items-center gap-4">
              <h3 className="text-2xl font-semibold text-primary">
                {currentCard.meaning}
              </h3>
              {currentCard.partOfSpeech && (
                <span className="px-2 py-1 bg-background rounded text-sm border">
                  {currentCard.partOfSpeech}
                </span>
              )}
              {currentCard.example && (
                <p className="italic text-muted-foreground mt-4">
                  "{currentCard.example}"
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {currentIndex + 1} / {data.length}
        </span>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
