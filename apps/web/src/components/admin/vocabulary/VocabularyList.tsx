'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteVocabulary } from '@/actions/vocabulary';
import { toast } from 'sonner';
import { Trash2, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  language: string;
  partOfSpeech: string | null;
  example: string | null;
  pronunciation: string | null;
  outgoingRelations: {
    type: string;
    target: {
      word: string;
      partOfSpeech: string | null;
    };
  }[];
  incomingRelations: {
    type: string;
    source: {
      word: string;
    };
  }[];
}

interface VocabularyListProps {
  initialData: Vocabulary[];
}

export function VocabularyList({ initialData }: VocabularyListProps) {
  // Filter out words that are derivatives of other words (appear as children)
  // We keep words that are roots or independent, or synonyms (optional, but user asked for "family" grouping)
  const [vocabularies, setVocabularies] = useState(
    initialData.filter(
      (v) =>
        !v.incomingRelations.some(
          (rel) => rel.type === 'derivative' || rel.type === 'form'
        )
    )
  );

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      const result = await deleteVocabulary(id);
      if (result.success) {
        toast.success('Vocabulary deleted');
        setVocabularies(vocabularies.filter((v) => v.id !== id));
      } else {
        toast.error('Failed to delete vocabulary');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  }

  function speak(text: string, lang: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      lang === 'en' ? 'en-US' : lang === 'ko' ? 'ko-KR' : 'zh-CN';
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-4">
      {vocabularies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
          No vocabulary found. Add some words to get started!
        </div>
      ) : (
        vocabularies.map((vocab) => (
          <div
            key={vocab.id}
            className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-xl border bg-card hover:shadow-md transition-all duration-200"
          >
            {/* Left Content: Word Info */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-start justify-between md:justify-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                      {vocab.word}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                      onClick={() => speak(vocab.word, vocab.language)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {vocab.pronunciation && (
                    <p className="text-sm text-muted-foreground font-mono">
                      {vocab.pronunciation}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="md:hidden">
                  {vocab.language === 'en'
                    ? 'English'
                    : vocab.language === 'ko'
                      ? 'Korean'
                      : 'Chinese'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {vocab.partOfSpeech && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider font-medium"
                    >
                      {vocab.partOfSpeech}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="hidden md:inline-flex">
                    {vocab.language === 'en'
                      ? 'English'
                      : vocab.language === 'ko'
                        ? 'Korean'
                        : 'Chinese'}
                  </Badge>
                </div>

                <p className="text-base text-foreground/90 leading-relaxed">
                  {vocab.meaning}
                </p>

                {vocab.example && (
                  <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3 py-1">
                    "{vocab.example}"
                  </p>
                )}
              </div>
            </div>

            {/* Right Content: Relations */}
            <div className="w-full md:w-80 shrink-0 space-y-4 pt-4 md:pt-0 md:border-l border-border/50 md:pl-6">
              {(() => {
                const relationsByType = vocab.outgoingRelations.reduce(
                  (acc, rel) => {
                    const type = rel.type || 'related';
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(rel.target.word);
                    return acc;
                  },
                  {} as Record<string, string[]>
                );

                const hasRelations = Object.keys(relationsByType).length > 0;

                if (!hasRelations) {
                  return (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
                      No relations found
                    </div>
                  );
                }

                return (
                  <>
                    {/* Word Family (Derivatives) Grouped by POS */}
                    {relationsByType['derivative'] && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            Word Family
                          </span>
                          <div className="h-px flex-1 bg-border/50"></div>
                        </div>

                        {(() => {
                          // Group derivatives by Part of Speech
                          const derivativesByPos = vocab.outgoingRelations
                            .filter(
                              (rel) => (rel.type || 'related') === 'derivative'
                            )
                            .reduce(
                              (acc, rel) => {
                                const pos = rel.target.partOfSpeech || 'other';
                                if (!acc[pos]) acc[pos] = [];
                                acc[pos].push(rel.target.word);
                                return acc;
                              },
                              {} as Record<string, string[]>
                            );

                          return (
                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(derivativesByPos).map(
                                ([pos, words]) => (
                                  <div
                                    key={pos}
                                    className="flex items-baseline gap-2 text-sm"
                                  >
                                    <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0 uppercase">
                                      {pos}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {words.map((word, idx) => (
                                        <span
                                          key={idx}
                                          className="text-foreground/90 bg-secondary/40 px-2 py-0.5 rounded text-sm"
                                        >
                                          {word}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Synonym */}
                    {relationsByType['synonym'] && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            Synonyms
                          </span>
                          <div className="h-px flex-1 bg-border/50"></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {relationsByType['synonym'].map((word, idx) => (
                            <Badge
                              key={idx}
                              variant="default"
                              className="hover:bg-primary/90 font-normal"
                            >
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Antonym */}
                    {relationsByType['antonym'] && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            Antonyms
                          </span>
                          <div className="h-px flex-1 bg-border/50"></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {relationsByType['antonym'].map((word, idx) => (
                            <Badge
                              key={idx}
                              variant="destructive"
                              className="hover:bg-destructive/90 font-normal"
                            >
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other types */}
                    {Object.entries(relationsByType).map(([type, words]) => {
                      if (['derivative', 'synonym', 'antonym'].includes(type))
                        return null;
                      return (
                        <div key={type} className="space-y-2 pt-2">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            {type}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {words.map((word, idx) => (
                              <Badge key={idx} variant="outline">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(vocab.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
