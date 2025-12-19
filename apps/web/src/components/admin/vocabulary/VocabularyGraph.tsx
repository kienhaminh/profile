'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Save, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  generateVocabularyPreview,
  saveVocabularyFamily,
} from '@/actions/vocabulary-ai';
import { deleteVocabulary } from '@/actions/vocabulary';

// Dynamically import ForceGraph2D with no SSR to avoid window is not defined error
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  language: string;
  partOfSpeech: string | null;
  outgoingRelations: {
    type: string;
    target: {
      word: string;
      partOfSpeech: string | null;
    };
  }[];
}

interface VocabularyGraphProps {
  data: Vocabulary[];
}

export function VocabularyGraph({ data }: VocabularyGraphProps) {
  const { theme } = useTheme();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<any>(null);
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDark = theme === 'dark';

  // Language Colors Configuration
  const LANGUAGE_COLORS = {
    en: {
      light: '#3b82f6', // Blue 500
      dark: '#60a5fa', // Blue 400
      label: 'English',
    },
    ko: {
      light: '#ef4444', // Red 500
      dark: '#f87171', // Red 400
      label: 'Korean',
    },
    zh: {
      light: '#eab308', // Yellow 500
      dark: '#facc15', // Yellow 400
      label: 'Chinese',
    },
    other: {
      light: '#64748b', // Slate 500
      dark: '#94a3b8', // Slate 400
      label: 'Other',
    },
  };

  const getLanguageColor = useCallback(
    (language: string | undefined) => {
      const langKey = (language || 'other') as keyof typeof LANGUAGE_COLORS;
      const config = LANGUAGE_COLORS[langKey] || LANGUAGE_COLORS.other;
      return isDark ? config.dark : config.light;
    },
    [isDark]
  );

  useEffect(() => {
    // Initial call
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight || 600,
      });
    }

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 600,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);

    const nodes: any[] = [];
    const links: any[] = [];
    const nodeIds = new Set();

    // Helper to find language for a word if not explicitly provided
    // This is a simple heuristic: if we have the word in our main data, use that language.
    const findLanguage = (word: string) => {
      const found = data.find((v) => v.word === word);
      return found?.language;
    };

    // First pass: Identify all target words to exclude them from being "root"
    const targetWords = new Set<string>();
    data.forEach((vocab) => {
      vocab.outgoingRelations.forEach((rel) => {
        targetWords.add(rel.target.word);
      });
    });

    // Second pass: Add root words (excluding those that are targets)
    data.forEach((vocab) => {
      // If a word is a target of another relation, don't add it as a root node here.
      // It will be added in the next pass with the correct group/type.
      if (!nodeIds.has(vocab.word) && !targetWords.has(vocab.word)) {
        const { id: _, ...vocabData } = vocab;
        nodes.push({
          id: vocab.word,
          dbId: vocab.id, // Pass database ID
          group: 'root', // Keep group for size/importance
          val: 20,
          ...vocabData,
        });
        nodeIds.add(vocab.word);
      }
    });

    // Second pass: Add related words and links
    data.forEach((vocab) => {
      vocab.outgoingRelations.forEach((rel) => {
        // Add target node if not exists
        if (!nodeIds.has(rel.target.word)) {
          // Try to determine language from the target object or fallback to source's language
          // In many cases, related words are in the same language, or we might want to inherit.
          // However, for translation relations, they might differ.
          // Ideally `rel.target` has `language`. If not, we might default to 'other' or inherit if appropriate.
          // For now, let's assume if it's missing, it might be the same language as source (unless it's a translation?)
          // But safely, let's try to find it or default.
          const targetLanguage =
            (rel.target as any).language ||
            findLanguage(rel.target.word) ||
            vocab.language; // Fallback to source language if unknown

          nodes.push({
            ...rel.target,
            id: rel.target.word,
            dbId: (rel.target as any).id, // Pass database ID
            group: rel.type || 'related',
            val: 10,
            language: targetLanguage,
          });
          nodeIds.add(rel.target.word);
        }

        // Add link
        links.push({
          source: vocab.word,
          target: rel.target.word,
          type: rel.type || 'related',
        });
      });
    });

    setGraphData({ nodes, links } as any);

    // Reset forces after data update
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-120);
      fgRef.current.d3Force('link').distance(50);
      fgRef.current.d3ReheatSimulation();
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [data, isDark]); // Re-run if theme changes (though colors are handled in render)

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.id;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(
        (n) => n + fontSize * 0.2
      ); // some padding

      // Draw circle node
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
      ctx.fillStyle = getLanguageColor(node.language);
      ctx.fill();

      // Draw text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillText(label, node.x, node.y + 8); // Offset text below node

      node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
    },
    [isDark, getLanguageColor]
  );

  const nodePointerAreaPaint = useCallback(
    (node: any, color: string, ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = color;
      const bckgDimensions = node.__bckgDimensions;
      if (bckgDimensions) {
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          bckgDimensions[0],
          bckgDimensions[1]
        );
      }
    },
    []
  );

  const handleExpand = async () => {
    if (!selectedNode) return;

    setIsExpanding(true);
    setPreviewData(null);
    try {
      toast.info(`Generating related words for "${selectedNode.word}"...`);
      const result = await generateVocabularyPreview(
        selectedNode.word,
        generationOptions
      );

      if (result.success && result.data) {
        setPreviewData(result.data);
        // Select all by default
        setSelectedPreviewIndices(result.data.family.map((_, idx) => idx));
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
  };

  const handleSaveExpanded = async () => {
    if (!previewData || !selectedNode) return;

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
        selectedNode.word
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
  };

  const handleDelete = async () => {
    if (!selectedNode) return;

    setIsDeleting(true);
    try {
      const result = await deleteVocabulary(selectedNode.dbId);
      if (result.success) {
        toast.success(`Successfully deleted "${selectedNode.word}"`);
        setSelectedNode(null);
        setShowDeleteConfirm(false);
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to delete vocabulary');
      }
    } catch (error) {
      toast.error('An error occurred during deletion');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePreviewSelection = (index: number) => {
    setSelectedPreviewIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-[700px] border rounded-lg overflow-hidden bg-card"
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="id"
          nodeColor={(node: any) => getLanguageColor(node.language)}
          nodeRelSize={6}
          linkColor={() =>
            isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
          }
          backgroundColor={isDark ? '#020817' : '#ffffff'}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          // Custom Node Rendering to show Text
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          onNodeClick={(node) => {
            setSelectedNode(node);
          }}
        />

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border shadow-sm space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Languages
          </h4>
          {Object.entries(LANGUAGE_COLORS).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: isDark ? config.dark : config.light,
                }}
              />
              <span className="text-xs font-medium">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Sheet
        open={!!selectedNode}
        onOpenChange={(open) => !open && setSelectedNode(null)}
      >
        <SheetContent className="p-6 overflow-y-auto">
          <SheetHeader className="p-0 mb-6">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2 pr-8">
              {selectedNode?.word}
              {selectedNode?.pronunciation && (
                <span className="text-sm font-normal text-muted-foreground font-mono">
                  {selectedNode.pronunciation}
                </span>
              )}
            </SheetTitle>
            <SheetDescription asChild>
              <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                {selectedNode?.language && (
                  <span
                    className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase text-white"
                    style={{
                      backgroundColor: getLanguageColor(selectedNode.language),
                    }}
                  >
                    {LANGUAGE_COLORS[
                      selectedNode.language as keyof typeof LANGUAGE_COLORS
                    ]?.label || selectedNode.language}
                  </span>
                )}
                {selectedNode?.partOfSpeech && (
                  <span className="inline-block px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium uppercase">
                    {selectedNode.partOfSpeech}
                  </span>
                )}
              </div>
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Meaning
              </h4>
              <p className="text-base">
                {selectedNode?.meaning || 'No definition available.'}
              </p>
            </div>

            {selectedNode?.example && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Example
                </h4>
                <p className="text-base italic text-muted-foreground">
                  "{selectedNode.example}"
                </p>
              </div>
            )}

            {selectedNode?.group && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Relation Type
                </h4>
                <p className="text-sm capitalize">{selectedNode.group}</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            {!previewData ? (
              <>
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Generation Options
                  </h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include Word Family
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include Synonyms
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include Antonyms
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExpand}
                  disabled={isExpanding}
                  className="w-full gap-2"
                  variant="outline"
                >
                  {isExpanding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Expand Vocabulary with AI
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Generates synonyms, antonyms, and related words.
                </p>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Select to Add</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewData(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {previewData.family.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded border text-sm cursor-pointer ${
                        selectedPreviewIndices.includes(idx)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => togglePreviewSelection(idx)}
                    >
                      <Checkbox
                        checked={selectedPreviewIndices.includes(idx)}
                        onCheckedChange={() => togglePreviewSelection(idx)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{item.word}</span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1"
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.meaning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSaveExpanded}
                  disabled={isSavingExpanded}
                  className="w-full gap-2"
                >
                  {isSavingExpanded ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Selected ({selectedPreviewIndices.length})
                </Button>
              </div>
            )}
          </div>

          <SheetFooter className="mt-6 border-t pt-6">
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Vocabulary
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              vocabulary "{selectedNode?.word}" and remove it from our servers.
              All related connections to this word will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
