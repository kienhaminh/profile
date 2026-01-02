'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Play,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
} from 'lucide-react';
import { authFetch } from '@/lib/auth';

interface FlashcardSet {
  id: string;
  name: string;
  language: string;
  description?: string;
  isActive: boolean;
  vocabularyCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Vocabulary {
  id: string;
  word: string;
  language: string;
  meaning: string;
  translation?: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  difficulty?: string;
}

interface FlashcardSetWithVocabularies extends FlashcardSet {
  vocabularies: Vocabulary[];
}

interface Stats {
  totalSets: number;
  activeSets: number;
  totalVocabularies: number;
  languages: string[];
}

interface PracticeStats {
  totalPractices: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracy: number;
}

interface PracticeSession {
  vocabularies: Vocabulary[];
  currentIndex: number;
  showAnswer: boolean;
  results: {
    vocabularyId: string;
    isCorrect: boolean;
  }[];
}

export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState('manage');

  // Manage Sets state
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Build Sets state
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [selectedSet, setSelectedSet] =
    useState<FlashcardSetWithVocabularies | null>(null);
  const [availableVocabularies, setAvailableVocabularies] = useState<
    Vocabulary[]
  >([]);
  const [loadingVocabs, setLoadingVocabs] = useState(false);
  const [addingVocabs, setAddingVocabs] = useState<string[]>([]);
  const [removingVocabs, setRemovingVocabs] = useState<string[]>([]);

  // Practice state
  const [practiceSetId, setPracticeSetId] = useState<string>('');
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(
    null
  );
  const [practiceSession, setPracticeSession] =
    useState<PracticeSession | null>(null);
  const [loadingPractice, setLoadingPractice] = useState(false);
  const [submittingPractice, setSubmittingPractice] = useState(false);

  // Form state for Manage Sets
  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchFlashcardSets();
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedSetId && activeTab === 'build') {
      fetchSetWithVocabularies(selectedSetId);
      fetchAvailableVocabularies(selectedSetId);
    }
  }, [selectedSetId, activeTab]);

  useEffect(() => {
    if (practiceSetId && activeTab === 'practice') {
      fetchPracticeStats(practiceSetId);
    }
  }, [practiceSetId, activeTab]);

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/flashcards');
      if (!response.ok) throw new Error('Failed to fetch flashcard sets');
      const data = await response.json();
      setFlashcardSets(data.items || []);
    } catch (err) {
      setError('Failed to load flashcard sets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authFetch('/api/admin/flashcards/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchSetWithVocabularies = async (setId: string) => {
    try {
      setLoadingVocabs(true);
      const response = await authFetch(`/api/admin/flashcards/${setId}`);
      if (!response.ok) throw new Error('Failed to fetch flashcard set');
      const data = await response.json();
      setSelectedSet(data);
    } catch (err) {
      setError('Failed to load flashcard set details');
      console.error(err);
    } finally {
      setLoadingVocabs(false);
    }
  };

  const fetchAvailableVocabularies = async (setId: string) => {
    try {
      const set = flashcardSets.find((s) => s.id === setId);
      if (!set) return;

      const response = await authFetch(
        `/api/admin/vocabularies?language=${set.language}`
      );
      if (!response.ok) throw new Error('Failed to fetch vocabularies');
      const data = await response.json();
      setAvailableVocabularies(data.items || []);
    } catch (err) {
      setError('Failed to load available vocabularies');
      console.error(err);
    }
  };

  const fetchPracticeStats = async (setId: string) => {
    try {
      const response = await authFetch(
        `/api/admin/flashcards/${setId}/practice`
      );
      if (!response.ok) throw new Error('Failed to fetch practice stats');
      const data = await response.json();
      setPracticeStats(data);
    } catch (err) {
      console.error('Failed to fetch practice stats:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.language) {
      setError('Name and language are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const url = editingSet
        ? `/api/admin/flashcards/${editingSet.id}`
        : '/api/admin/flashcards';
      const method = editingSet ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save flashcard set');
      }

      setSuccess(
        editingSet ? 'Flashcard set updated!' : 'Flashcard set created!'
      );
      setShowDialog(false);
      resetForm();
      await fetchFlashcardSets();
      await fetchStats();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save flashcard set'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (set: FlashcardSet) => {
    setEditingSet(set);
    setFormData({
      name: set.name,
      language: set.language,
      description: set.description || '',
      isActive: set.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/flashcards/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard set');
      }

      setSuccess('Flashcard set deleted successfully');
      await fetchFlashcardSets();
      await fetchStats();
    } catch (err) {
      setError('Failed to delete flashcard set');
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      language: 'en',
      description: '',
      isActive: true,
    });
    setEditingSet(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleAddVocabulary = async (vocabularyId: string) => {
    if (!selectedSetId) return;

    try {
      setAddingVocabs([...addingVocabs, vocabularyId]);
      const response = await fetch(
        `/api/admin/flashcards/${selectedSetId}/vocabularies`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ vocabularyIds: [vocabularyId] }),
        }
      );

      if (!response.ok) throw new Error('Failed to add vocabulary');

      setSuccess('Vocabulary added to flashcard set');
      await fetchSetWithVocabularies(selectedSetId);
      await fetchFlashcardSets();
    } catch (err) {
      setError('Failed to add vocabulary');
    } finally {
      setAddingVocabs(addingVocabs.filter((id) => id !== vocabularyId));
    }
  };

  const handleRemoveVocabulary = async (vocabularyId: string) => {
    if (!selectedSetId) return;

    try {
      setRemovingVocabs([...removingVocabs, vocabularyId]);
      const response = await fetch(
        `/api/admin/flashcards/${selectedSetId}/vocabularies`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ vocabularyIds: [vocabularyId] }),
        }
      );

      if (!response.ok) throw new Error('Failed to remove vocabulary');

      setSuccess('Vocabulary removed from flashcard set');
      await fetchSetWithVocabularies(selectedSetId);
      await fetchFlashcardSets();
    } catch (err) {
      setError('Failed to remove vocabulary');
    } finally {
      setRemovingVocabs(removingVocabs.filter((id) => id !== vocabularyId));
    }
  };

  const handleStartPractice = async () => {
    if (!practiceSetId) return;

    try {
      setLoadingPractice(true);
      const response = await authFetch(
        `/api/admin/flashcards/${practiceSetId}`
      );
      if (!response.ok) throw new Error('Failed to load flashcard set');
      const data = await response.json();

      if (!data.vocabularies || data.vocabularies.length === 0) {
        setError('This flashcard set has no vocabularies to practice');
        return;
      }

      // Shuffle vocabularies
      const shuffled = [...data.vocabularies].sort(() => Math.random() - 0.5);

      setPracticeSession({
        vocabularies: shuffled,
        currentIndex: 0,
        showAnswer: false,
        results: [],
      });
    } catch (err) {
      setError('Failed to start practice session');
      console.error(err);
    } finally {
      setLoadingPractice(false);
    }
  };

  const handleRevealAnswer = () => {
    if (!practiceSession) return;
    setPracticeSession({
      ...practiceSession,
      showAnswer: true,
    });
  };

  const handleMarkCorrect = () => {
    if (!practiceSession) return;
    const currentVocab =
      practiceSession.vocabularies[practiceSession.currentIndex];

    setPracticeSession({
      ...practiceSession,
      results: [
        ...practiceSession.results,
        { vocabularyId: currentVocab.id, isCorrect: true },
      ],
      currentIndex: practiceSession.currentIndex + 1,
      showAnswer: false,
    });
  };

  const handleMarkIncorrect = () => {
    if (!practiceSession) return;
    const currentVocab =
      practiceSession.vocabularies[practiceSession.currentIndex];

    setPracticeSession({
      ...practiceSession,
      results: [
        ...practiceSession.results,
        { vocabularyId: currentVocab.id, isCorrect: false },
      ],
      currentIndex: practiceSession.currentIndex + 1,
      showAnswer: false,
    });
  };

  const handleSubmitPractice = async () => {
    if (!practiceSession || !practiceSetId) return;

    try {
      setSubmittingPractice(true);
      const response = await fetch(
        `/api/admin/flashcards/${practiceSetId}/practice`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ results: practiceSession.results }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit practice results');

      setSuccess('Practice session completed!');
      setPracticeSession(null);
      await fetchPracticeStats(practiceSetId);
    } catch (err) {
      setError('Failed to submit practice results');
      console.error(err);
    } finally {
      setSubmittingPractice(false);
    }
  };

  const getAvailableVocabsNotInSet = () => {
    if (!selectedSet || !availableVocabularies) return [];
    const setVocabIds = new Set(selectedSet.vocabularies.map((v) => v.id));
    return availableVocabularies.filter((v) => !setVocabIds.has(v.id));
  };

  const isSessionComplete = () => {
    return (
      practiceSession &&
      practiceSession.currentIndex >= practiceSession.vocabularies.length
    );
  };

  const getPracticeProgress = () => {
    if (!practiceSession) return { completed: 0, total: 0, percentage: 0 };
    const completed = practiceSession.currentIndex;
    const total = practiceSession.vocabularies.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const getSessionResults = () => {
    if (!practiceSession) return { correct: 0, incorrect: 0, accuracy: 0 };
    const correct = practiceSession.results.filter((r) => r.isCorrect).length;
    const incorrect = practiceSession.results.filter(
      (r) => !r.isCorrect
    ).length;
    const total = correct + incorrect;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, incorrect, accuracy };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Flashcards
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              <span className="text-[10px] font-medium text-orange-500 uppercase tracking-wide">
                Learning
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage flashcard sets, build vocabulary collections, and practice.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sets</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vocabularies
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalVocabularies}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.languages.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Sets
          </TabsTrigger>
          <TabsTrigger value="build">
            <Edit className="h-4 w-4 mr-2" />
            Build Sets
          </TabsTrigger>
          <TabsTrigger value="practice">
            <Play className="h-4 w-4 mr-2" />
            Practice
          </TabsTrigger>
        </TabsList>

        {/* Manage Sets Tab */}
        <TabsContent value="manage" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Flashcard Set
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Flashcard Sets ({flashcardSets.length})</CardTitle>
              <CardDescription>
                Manage your flashcard collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : flashcardSets.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No flashcard sets found. Click &quot;Create Flashcard
                    Set&quot; to create one.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {flashcardSets.map((set) => (
                    <Card key={set.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">
                                {set.name}
                              </CardTitle>
                              <Badge variant="outline">
                                {set.language.toUpperCase()}
                              </Badge>
                              {set.isActive ? (
                                <Badge className="bg-green-500">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            {set.description && (
                              <CardDescription>
                                {set.description}
                              </CardDescription>
                            )}
                            <div className="mt-2 text-sm text-muted-foreground">
                              {set.vocabularyCount || 0} vocabularies
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(set)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(set.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build Sets Tab */}
        <TabsContent value="build" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Flashcard Set</CardTitle>
              <CardDescription>
                Choose a flashcard set to manage its vocabularies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a flashcard set" />
                </SelectTrigger>
                <SelectContent>
                  {flashcardSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name} ({set.language.toUpperCase()}) -{' '}
                      {set.vocabularyCount || 0} words
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedSetId && selectedSet && (
            <>
              {/* Current Vocabularies */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Current Vocabularies ({selectedSet.vocabularies.length})
                  </CardTitle>
                  <CardDescription>
                    Vocabularies currently in {selectedSet.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingVocabs ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : selectedSet.vocabularies.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No vocabularies in this set. Add some from the available
                        list below.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSet.vocabularies.map((vocab) => (
                        <div
                          key={vocab.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {vocab.word}
                              </span>
                              {vocab.difficulty && (
                                <Badge variant="secondary">
                                  {vocab.difficulty}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {vocab.meaning}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVocabulary(vocab.id)}
                            disabled={removingVocabs.includes(vocab.id)}
                          >
                            {removingVocabs.includes(vocab.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Vocabularies */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Available Vocabularies (
                    {getAvailableVocabsNotInSet().length})
                  </CardTitle>
                  <CardDescription>
                    Add vocabularies from {selectedSet.language.toUpperCase()}{' '}
                    to this set
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingVocabs ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : getAvailableVocabsNotInSet().length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No more vocabularies available to add.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getAvailableVocabsNotInSet().map((vocab) => (
                        <div
                          key={vocab.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {vocab.word}
                              </span>
                              {vocab.difficulty && (
                                <Badge variant="secondary">
                                  {vocab.difficulty}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {vocab.meaning}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddVocabulary(vocab.id)}
                            disabled={addingVocabs.includes(vocab.id)}
                          >
                            {addingVocabs.includes(vocab.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Flashcard Set</CardTitle>
              <CardDescription>
                Choose a flashcard set to practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={practiceSetId} onValueChange={setPracticeSetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a flashcard set" />
                </SelectTrigger>
                <SelectContent>
                  {flashcardSets
                    .filter(
                      (set) => set.isActive && (set.vocabularyCount || 0) > 0
                    )
                    .map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name} ({set.language.toUpperCase()}) -{' '}
                        {set.vocabularyCount || 0} words
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {practiceSetId && practiceStats && !practiceSession && (
            <Card>
              <CardHeader>
                <CardTitle>Practice Statistics</CardTitle>
                <CardDescription>
                  Your practice history for this set
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Practices
                    </p>
                    <p className="text-2xl font-bold">
                      {practiceStats.totalPractices}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-2xl font-bold">
                      {practiceStats.accuracy}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Correct / Incorrect
                    </p>
                    <p className="text-2xl font-bold">
                      {practiceStats.totalCorrect} /{' '}
                      {practiceStats.totalIncorrect}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={handleStartPractice}
                    disabled={loadingPractice}
                  >
                    {loadingPractice ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Start Practice Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {practiceSession && !isSessionComplete() && (
            <Card>
              <CardHeader>
                <CardTitle>Practice Session</CardTitle>
                <CardDescription>
                  Progress: {getPracticeProgress().completed} /{' '}
                  {getPracticeProgress().total} (
                  {getPracticeProgress().percentage}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4 py-8">
                  <div className="text-4xl font-bold">
                    {
                      practiceSession.vocabularies[practiceSession.currentIndex]
                        .word
                    }
                  </div>

                  {practiceSession.showAnswer ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-muted rounded-lg">
                        <p className="text-xl mb-2">
                          {
                            practiceSession.vocabularies[
                              practiceSession.currentIndex
                            ].meaning
                          }
                        </p>
                        {practiceSession.vocabularies[
                          practiceSession.currentIndex
                        ].translation && (
                          <p className="text-muted-foreground">
                            Translation:{' '}
                            {
                              practiceSession.vocabularies[
                                practiceSession.currentIndex
                              ].translation
                            }
                          </p>
                        )}
                        {practiceSession.vocabularies[
                          practiceSession.currentIndex
                        ].example && (
                          <p className="text-sm italic mt-2">
                            Example:{' '}
                            {
                              practiceSession.vocabularies[
                                practiceSession.currentIndex
                              ].example
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={handleMarkIncorrect}
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Incorrect
                        </Button>
                        <Button
                          onClick={handleMarkCorrect}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Correct
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleRevealAnswer}>
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Reveal Answer
                    </Button>
                  )}
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Correct:{' '}
                    {practiceSession.results.filter((r) => r.isCorrect).length}
                  </span>
                  <span>
                    Incorrect:{' '}
                    {practiceSession.results.filter((r) => !r.isCorrect).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {practiceSession && isSessionComplete() && (
            <Card>
              <CardHeader>
                <CardTitle>Practice Session Complete!</CardTitle>
                <CardDescription>Here are your results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Correct
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {getSessionResults().correct}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Incorrect
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {getSessionResults().incorrect}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Accuracy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {getSessionResults().accuracy}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setPracticeSession(null)}
                    variant="outline"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Practice
                  </Button>
                  <Button
                    onClick={handleSubmitPractice}
                    disabled={submittingPractice}
                  >
                    {submittingPractice && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSet ? 'Edit' : 'Create'} Flashcard Set
            </DialogTitle>
            <DialogDescription>
              {editingSet ? 'Update' : 'Create a new'} flashcard set for
              organizing vocabularies
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g., Business English, JLPT N5 Vocabulary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                  <SelectItem value="vi">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the purpose of this flashcard set"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (available for practice)
              </Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSet ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Flashcard Set?"
        description="This action cannot be undone. This will permanently delete the flashcard set and remove all vocabulary associations."
      />
    </div>
  );
}
