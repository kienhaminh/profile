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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Link2,
  FileText,
  Image as ImageIcon,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Database,
  Calendar,
} from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { authFetch } from '@/lib/auth';

interface KnowledgeEntry {
  id: string;
  title: string;
  sourceType: 'url' | 'document' | 'image';
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  extractedData: {
    summary?: string;
    keyPoints?: string[];
    keywords?: string[];
    entities?: { name: string; type: string }[];
    rawText?: string;
    metadata?: Record<string, string | number | boolean | string[]>;
  };
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

interface Stats {
  total: number;
  bySourceType: {
    url: number;
    document: number;
    image: number;
  };
  byStatus: {
    completed: number;
    processing: number;
    failed: number;
  };
}

export default function KnowledgeExtractionPage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('url');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, statsRes] = await Promise.all([
        authFetch('/api/admin/knowledge'),
        authFetch('/api/admin/knowledge/stats'),
      ]);

      if (!entriesRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const entriesData = await entriesRes.json();
      const statsData = await statsRes.json();

      setEntries(entriesData.items || []);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load knowledge entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/knowledge/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to extract knowledge');
      }

      setSuccess('Knowledge extracted successfully from URL!');
      setUrl('');
      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to extract knowledge from URL'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleExtractFromFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/knowledge/extract', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to extract knowledge');
      }

      setSuccess(`Knowledge extracted successfully from ${file.name}!`);
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to extract knowledge from file'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/knowledge/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      setSuccess('Knowledge entry deleted successfully');
      await fetchData();
    } catch {
      setError('Failed to delete knowledge entry');
    } finally {
      setDeleteId(null);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <Link2 className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Knowledge Extraction
        </h1>
        <p className="text-muted-foreground mt-2">
          Extract and store knowledge from URLs, documents, and images using AI
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Entries
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">From URLs</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bySourceType.url}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                From Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.bySourceType.document}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">From Images</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.bySourceType.image}
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

      {/* Extraction Form */}
      <Card>
        <CardHeader>
          <CardTitle>Extract Knowledge</CardTitle>
          <CardDescription>
            Choose a source type and provide the content to extract knowledge
            from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url">
                <Link2 className="h-4 w-4 mr-2" />
                URL
              </TabsTrigger>
              <TabsTrigger value="document">
                <FileText className="h-4 w-4 mr-2" />
                Document
              </TabsTrigger>
              <TabsTrigger value="image">
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <form onSubmit={handleExtractFromUrl} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={processing}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a URL to extract content, summarize, and identify key
                    information
                  </p>
                </div>
                <Button type="submit" disabled={processing}>
                  {processing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Extract from URL
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="document" className="space-y-4">
              <form onSubmit={handleExtractFromFile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document">Upload Document</Label>
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={processing}
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, TXT, DOC, DOCX
                  </p>
                </div>
                <Button type="submit" disabled={processing || !file}>
                  {processing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Extract from Document
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <form onSubmit={handleExtractFromFile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={processing}
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: JPG, PNG, GIF, WebP (OCR and object
                    detection)
                  </p>
                </div>
                <Button type="submit" disabled={processing || !file}>
                  {processing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Extract from Image
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Knowledge Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Knowledge ({entries.length})</CardTitle>
          <CardDescription>
            Browse and manage previously extracted knowledge entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No knowledge entries yet. Start by extracting content from a URL
                or file above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getSourceIcon(entry.sourceType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1">
                            {entry.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary">
                              {entry.sourceType}
                            </Badge>
                            {entry.status === 'completed' && (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                            {entry.fileName && (
                              <Badge variant="outline">
                                {formatFileSize(entry.fileSize)}
                              </Badge>
                            )}
                          </div>
                          {entry.sourceUrl && (
                            <p className="text-sm text-muted-foreground truncate">
                              {entry.sourceUrl}
                            </p>
                          )}
                          {entry.fileName && (
                            <p className="text-sm text-muted-foreground">
                              File: {entry.fileName}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(entry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    {entry.extractedData.summary && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">
                          {entry.extractedData.summary}
                        </p>
                      </div>
                    )}

                    {/* Key Points */}
                    {entry.extractedData.keyPoints &&
                      entry.extractedData.keyPoints.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Key Points
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {entry.extractedData.keyPoints.map((point, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-muted-foreground"
                              >
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Keywords */}
                    {entry.extractedData.keywords &&
                      entry.extractedData.keywords.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Keywords
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.extractedData.keywords.map(
                              (keyword, idx) => (
                                <Badge key={idx} variant="outline">
                                  {keyword}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Entities */}
                    {entry.extractedData.entities &&
                      entry.extractedData.entities.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Entities
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.extractedData.entities.map((entity, idx) => (
                              <Badge key={idx} variant="secondary">
                                {entity.name} ({entity.type})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Metadata */}
                    <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
                      <Calendar className="h-3 w-3 mr-1" />
                      Extracted on {formatDate(entry.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Knowledge Entry?"
        description="This action cannot be undone. This will permanently delete the knowledge entry and all associated data."
      />
    </div>
  );
}
