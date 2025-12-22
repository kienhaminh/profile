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
  Search,
} from 'lucide-react';
import { authFetch } from '@/lib/auth';

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
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  byLanguage: Record<string, number>;
  byDifficulty: Record<string, number>;
}

export default function VocabulariesPage() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    word: '',
    language: 'en',
    meaning: '',
    translation: '',
    pronunciation: '',
    example: '',
    partOfSpeech: 'noun',
    difficulty: 'intermediate',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [filterLanguage, filterDifficulty, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterLanguage) queryParams.append('language', filterLanguage);
      if (filterDifficulty) queryParams.append('difficulty', filterDifficulty);
      if (searchTerm) queryParams.append('search', searchTerm);

      const [vocabsRes, statsRes] = await Promise.all([
        authFetch(`/api/admin/vocabularies?${queryParams.toString()}`),
        authFetch('/api/admin/vocabularies/stats'),
      ]);

      if (!vocabsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const vocabsData = await vocabsRes.json();
      const statsData = await statsRes.json();

      setVocabularies(vocabsData.items || []);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load vocabularies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word || !formData.language || !formData.meaning) {
      setError('Word, language, and meaning are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const url = editingVocab
        ? `/api/admin/vocabularies/${editingVocab.id}`
        : '/api/admin/vocabularies';
      const method = editingVocab ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save vocabulary');
      }

      setSuccess(editingVocab ? 'Vocabulary updated!' : 'Vocabulary created!');
      setShowDialog(false);
      resetForm();
      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save vocabulary'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (vocab: Vocabulary) => {
    setEditingVocab(vocab);
    setFormData({
      word: vocab.word,
      language: vocab.language,
      meaning: vocab.meaning,
      translation: vocab.translation || '',
      pronunciation: vocab.pronunciation || '',
      example: vocab.example || '',
      partOfSpeech: vocab.partOfSpeech || 'noun',
      difficulty: vocab.difficulty || 'intermediate',
      notes: vocab.notes || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/vocabularies/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete vocabulary');
      }

      setSuccess('Vocabulary deleted successfully');
      await fetchData();
    } catch (err) {
      setError('Failed to delete vocabulary');
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      word: '',
      language: 'en',
      meaning: '',
      translation: '',
      pronunciation: '',
      example: '',
      partOfSpeech: 'noun',
      difficulty: 'intermediate',
      notes: '',
    });
    setEditingVocab(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vocabularies</h1>
          <p className="text-muted-foreground mt-2">
            Manage vocabulary entries for different languages
          </p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vocabulary
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vocabularies
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.byLanguage).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Beginner Level
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byDifficulty.beginner || 0}
              </div>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Vocabularies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search word or meaning..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All languages</SelectItem>
                  {stats &&
                    Object.keys(stats.byLanguage).map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.toUpperCase()} ({stats.byLanguage[lang]})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={filterDifficulty}
                onValueChange={setFilterDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabularies List */}
      <Card>
        <CardHeader>
          <CardTitle>All Vocabularies ({vocabularies.length})</CardTitle>
          <CardDescription>
            Browse and manage your vocabulary collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : vocabularies.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No vocabularies found. Click &quot;Add Vocabulary&quot; to
                create one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vocabularies.map((vocab) => (
                <Card key={vocab.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">
                            {vocab.word}
                          </h3>
                          <Badge variant="outline">
                            {vocab.language.toUpperCase()}
                          </Badge>
                          <Badge
                            className={getDifficultyColor(
                              vocab.difficulty || 'intermediate'
                            )}
                          >
                            {vocab.difficulty}
                          </Badge>
                          {vocab.partOfSpeech && (
                            <Badge variant="secondary">
                              {vocab.partOfSpeech}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{vocab.meaning}</p>
                        {vocab.translation && (
                          <p className="text-sm">
                            <span className="font-medium">Translation:</span>{' '}
                            {vocab.translation}
                          </p>
                        )}
                        {vocab.pronunciation && (
                          <p className="text-sm">
                            <span className="font-medium">Pronunciation:</span>{' '}
                            {vocab.pronunciation}
                          </p>
                        )}
                        {vocab.example && (
                          <p className="text-sm italic">
                            <span className="font-medium">Example:</span>{' '}
                            {vocab.example}
                          </p>
                        )}
                        {vocab.notes && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Notes:</span>{' '}
                            {vocab.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(vocab)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(vocab.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVocab ? 'Edit' : 'Add'} Vocabulary
            </DialogTitle>
            <DialogDescription>
              {editingVocab ? 'Update' : 'Create a new'} vocabulary entry
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="word">Word *</Label>
                <Input
                  id="word"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  required
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="meaning">Meaning *</Label>
              <Textarea
                id="meaning"
                value={formData.meaning}
                onChange={(e) =>
                  setFormData({ ...formData, meaning: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="translation">Translation</Label>
              <Input
                id="translation"
                value={formData.translation}
                onChange={(e) =>
                  setFormData({ ...formData, translation: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pronunciation">Pronunciation</Label>
                <Input
                  id="pronunciation"
                  value={formData.pronunciation}
                  onChange={(e) =>
                    setFormData({ ...formData, pronunciation: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partOfSpeech">Part of Speech</Label>
                <Select
                  value={formData.partOfSpeech}
                  onValueChange={(value) =>
                    setFormData({ ...formData, partOfSpeech: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noun">Noun</SelectItem>
                    <SelectItem value="verb">Verb</SelectItem>
                    <SelectItem value="adjective">Adjective</SelectItem>
                    <SelectItem value="adverb">Adverb</SelectItem>
                    <SelectItem value="pronoun">Pronoun</SelectItem>
                    <SelectItem value="preposition">Preposition</SelectItem>
                    <SelectItem value="conjunction">Conjunction</SelectItem>
                    <SelectItem value="interjection">Interjection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="example">Example Sentence</Label>
              <Textarea
                id="example"
                value={formData.example}
                onChange={(e) =>
                  setFormData({ ...formData, example: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    difficulty: value as
                      | 'beginner'
                      | 'intermediate'
                      | 'advanced',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
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
                {editingVocab ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Vocabulary?"
        description="This action cannot be undone. This will permanently delete the vocabulary entry."
      />
    </div>
  );
}
