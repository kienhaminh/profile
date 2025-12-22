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
import { Trash2, Volume2, Sparkles, Loader2, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import {
  generateVocabularyPreview,
  saveVocabularyFamily,
} from '@/actions/vocabulary-ai';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Expansion state
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedPreviewIndices, setSelectedPreviewIndices] = useState<
    number[]
  >([]);
  const [isSavingExpanded, setIsSavingExpanded] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    includeFamily: true,
    includeSynonyms: true,
    includeAntonyms: true,
  });

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const result = await deleteVocabulary(deleteId);
      if (result.success) {
        toast.success('Vocabulary deleted');
        setVocabularies(vocabularies.filter((v) => v.id !== deleteId));
      } else {
        toast.error('Failed to delete vocabulary');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  function speak(text: string, lang: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      lang === 'en' ? 'en-US' : lang === 'ko' ? 'ko-KR' : 'zh-CN';
    window.speechSynthesis.speak(utterance);
  }

  async function handleExpand() {
    if (!selectedVocab) return;

    setIsExpanding(true);
    setPreviewData(null);
    try {
      toast.info(`Generating related words for "${selectedVocab.word}"...`);
      const result = await generateVocabularyPreview(
        selectedVocab.word,
        generationOptions
      );

      if (result.success && result.data) {
        setPreviewData(result.data);
        // Select all by default
        setSelectedPreviewIndices(
          result.data.family.map((_: any, idx: number) => idx)
        );
        toast.success('Preview generated! Select words to save.');
      } else {
        toast.error(result.error || 'Failed to generate preview.');
      }
    } catch (error) {
      toast.error('An error occurred during expansion.');
      console.error(error);
    } finally {
      setIsExpanding(false);
    }
  }

  async function handleSaveExpanded() {
    if (!previewData || !selectedVocab) return;

    setIsSavingExpanded(true);
    try {
      const dataToSave = {
        ...previewData,
        family: previewData.family
          .filter((_: any, idx: number) => selectedPreviewIndices.includes(idx))
          .map((item: any) => ({
            ...item,
            language: item.language || previewData.rootWord.language,
          })),
      };

      const saveResult = await saveVocabularyFamily(
        dataToSave,
        selectedVocab.word
      );

      if (saveResult.success) {
        toast.success('Successfully expanded vocabulary!');
        window.location.reload();
      } else {
        toast.error('Failed to save expanded vocabulary.');
      }
    } catch (error) {
      toast.error('An error occurred during save.');
      console.error(error);
    } finally {
      setIsSavingExpanded(false);
    }
  }

  const togglePreviewSelection = (index: number) => {
    setSelectedPreviewIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

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
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedVocab(vocab)}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(vocab.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Word"
        description={`Are you sure you want to delete "${vocabularies.find((v) => v.id === deleteId)?.word}"? This action cannot be undone.`}
      />

      <Sheet
        open={!!selectedVocab}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVocab(null);
            setPreviewData(null);
          }
        }}
      >
        <SheetContent className="p-6 overflow-y-auto w-full sm:max-w-[500px]">
          <SheetHeader className="p-0 mb-6">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2 pr-8">
              {selectedVocab?.word}
            </SheetTitle>
            <SheetDescription>
              Expand vocabulary using AI by generating related words, synonyms,
              and antonyms.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {!previewData ? (
              <>
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Generation Options
                  </h4>
                  <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="includeFamily"
                        checked={generationOptions.includeFamily}
                        onCheckedChange={(checked) =>
                          setGenerationOptions((prev) => ({
                            ...prev,
                            includeFamily: checked as boolean,
                          }))
                        }
                      />
                      <label
                        htmlFor="includeFamily"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Include Word Family (Derivatives)
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="includeSynonyms"
                        checked={generationOptions.includeSynonyms}
                        onCheckedChange={(checked) =>
                          setGenerationOptions((prev) => ({
                            ...prev,
                            includeSynonyms: checked as boolean,
                          }))
                        }
                      />
                      <label
                        htmlFor="includeSynonyms"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Include Synonyms
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="includeAntonyms"
                        checked={generationOptions.includeAntonyms}
                        onCheckedChange={(checked) =>
                          setGenerationOptions((prev) => ({
                            ...prev,
                            includeAntonyms: checked as boolean,
                          }))
                        }
                      />
                      <label
                        htmlFor="includeAntonyms"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Include Antonyms
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExpand}
                  disabled={isExpanding}
                  className="w-full gap-2 shadow-sm"
                  size="lg"
                >
                  {isExpanding ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  Expand with AI
                </Button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Words to Add
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewData(null)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                  {previewData.family.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedPreviewIndices.includes(idx)
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                      onClick={() => togglePreviewSelection(idx)}
                    >
                      <Checkbox
                        checked={selectedPreviewIndices.includes(idx)}
                        onCheckedChange={() => togglePreviewSelection(idx)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold truncate">
                            {item.word}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5 font-bold uppercase"
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.meaning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSaveExpanded}
                  disabled={isSavingExpanded}
                  className="w-full gap-2 shadow-md"
                  size="lg"
                >
                  {isSavingExpanded ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  Save Selected ({selectedPreviewIndices.length})
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
