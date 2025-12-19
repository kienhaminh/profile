'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  generateVocabularyPreview,
  saveVocabularyFamily,
  checkVocabulary,
} from '@/actions/vocabulary-ai';
import { toast } from 'sonner';
import {
  Loader2,
  Sparkles,
  Check,
  Save,
  Search,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  word: z.string().min(1, 'Word is required'),
});

interface PreviewData {
  rootWord: {
    word: string;
    meaning: string;
    partOfSpeech?: string;
    language: string;
    pronunciation?: string;
    example?: string;
  };
  family: {
    word: string;
    meaning: string;
    partOfSpeech?: string;
    type?: string;
    language?: string;
  }[];
}

export function VocabularyForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<
    'idle' | 'valid' | 'invalid' | 'exists'
  >('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [existingWord, setExistingWord] = useState<any>(null);

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedFamilyIndices, setSelectedFamilyIndices] = useState<number[]>(
    []
  );
  const [generationOptions, setGenerationOptions] = useState({
    includeFamily: true,
    includeSynonyms: true,
    includeAntonyms: true,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
    },
  });

  const resetState = () => {
    setCheckStatus('idle');
    setValidationMessage('');
    setExistingWord(null);
    setPreviewData(null);
    setSelectedFamilyIndices([]);
  };

  async function onCheck(e: React.MouseEvent) {
    e.preventDefault();
    const word = form.getValues('word');
    if (!word) {
      toast.error('Please enter a word first');
      return;
    }

    setIsChecking(true);
    resetState();

    try {
      const result = await checkVocabulary(word);

      if (result.exists) {
        setCheckStatus('exists');
        setExistingWord(result.data?.rootWord);
        toast.info(`"${word}" already exists in the database.`);
      } else if (result.valid) {
        setCheckStatus('valid');
        setValidationMessage(result.reason || 'Word is valid.');
        toast.success(`"${word}" is valid! You can now generate the preview.`);
      } else {
        setCheckStatus('invalid');
        setValidationMessage(result.reason || 'Word seems invalid.');
        toast.error(`"${word}" does not seem to be a valid word.`);
      }
    } catch (error) {
      toast.error('Failed to check vocabulary');
    } finally {
      setIsChecking(false);
    }
  }

  async function onGenerate(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setPreviewData(null);
    try {
      const result = await generateVocabularyPreview(
        values.word,
        generationOptions
      );
      if (result.success && result.data) {
        setPreviewData(result.data);
        // Select all by default
        setSelectedFamilyIndices(result.data.family.map((_, idx) => idx));
        toast.success('Preview generated!');
      } else {
        toast.error(result.error || 'Failed to generate preview');
      }
    } catch (error) {
      toast.error('An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSave() {
    if (!previewData) return;

    setIsSaving(true);
    try {
      // Filter family based on selection and ensure language is present
      const dataToSave = {
        ...previewData,
        family: previewData.family
          .filter((_, idx) => selectedFamilyIndices.includes(idx))
          .map((item) => ({
            ...item,
            language: item.language || previewData.rootWord.language,
          })),
      };

      const result = await saveVocabularyFamily(dataToSave);
      if (result.success) {
        toast.success(`Saved "${result.rootWord}" and selected relations!`);
        form.reset();
        resetState();
      } else {
        toast.error('Failed to save vocabulary');
      }
    } catch (error) {
      toast.error('An error occurred during save');
    } finally {
      setIsSaving(false);
    }
  }

  const toggleFamilySelection = (index: number) => {
    setSelectedFamilyIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Word</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-4">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Word</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a word (e.g. Generate)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={onCheck}
                disabled={isChecking || isGenerating}
                variant="secondary"
                className="flex-1 gap-2"
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Check Word
              </Button>

              {checkStatus === 'valid' && (
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Checkbox
                        id="opt-family"
                        checked={generationOptions.includeFamily}
                        onCheckedChange={(c) =>
                          setGenerationOptions((prev) => ({
                            ...prev,
                            includeFamily: !!c,
                          }))
                        }
                      />
                      <label htmlFor="opt-family">Family</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox
                        id="opt-syn"
                        checked={generationOptions.includeSynonyms}
                        onCheckedChange={(c) =>
                          setGenerationOptions((prev) => ({
                            ...prev,
                            includeSynonyms: !!c,
                          }))
                        }
                      />
                      <label htmlFor="opt-syn">Synonyms</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox
                        id="opt-ant"
                        checked={generationOptions.includeAntonyms}
                        onCheckedChange={(c) =>
                          setGenerationOptions((prev) => ({
                            ...prev,
                            includeAntonyms: !!c,
                          }))
                        }
                      />
                      <label htmlFor="opt-ant">Antonyms</label>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate Preview
                  </Button>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {checkStatus === 'exists' && existingWord && (
              <Alert
                variant="default"
                className="bg-blue-50 border-blue-200 text-blue-800"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Word Exists</AlertTitle>
                <AlertDescription>
                  "{existingWord.word}" is already in the database.
                  <div className="mt-2 text-sm">
                    <strong>Meaning:</strong> {existingWord.meaning}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {checkStatus === 'invalid' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Invalid Word</AlertTitle>
                <AlertDescription>
                  {validationMessage ||
                    'This word does not appear to be valid.'}
                </AlertDescription>
              </Alert>
            )}

            {checkStatus === 'valid' && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Valid Word</AlertTitle>
                <AlertDescription>{validationMessage}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </div>

      {previewData && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview & Select</h3>
            <Button onClick={onSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Selected
            </Button>
          </div>

          {/* Root Word Card */}
          <div className="p-6 rounded-xl border bg-card shadow-sm border-primary/20 bg-primary/5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {previewData.rootWord.word}
                  </h3>
                  <Badge variant="default">Root</Badge>
                </div>
                {previewData.rootWord.pronunciation && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {previewData.rootWord.pronunciation}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                {previewData.rootWord.partOfSpeech && (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider font-medium"
                  >
                    {previewData.rootWord.partOfSpeech}
                  </Badge>
                )}
              </div>
              <p className="text-base text-foreground/90 leading-relaxed">
                {previewData.rootWord.meaning}
              </p>
              {previewData.rootWord.example && (
                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3 py-1">
                  "{previewData.rootWord.example}"
                </p>
              )}
            </div>
          </div>

          {/* Family Members Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Related Words
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {previewData.family.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedFamilyIndices.includes(idx)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleFamilySelection(idx)}
                >
                  <Checkbox
                    checked={selectedFamilyIndices.includes(idx)}
                    onCheckedChange={() => toggleFamilySelection(idx)}
                    className="mt-1"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{item.word}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase"
                      >
                        {item.type || 'related'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.partOfSpeech && (
                        <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-1 rounded">
                          {item.partOfSpeech}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.meaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
