'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function SeoGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      keywords: formData.get('keywords'),
      summary: formData.get('summary'),
    };

    try {
      const response = await fetch('/api/tools/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to generate metadata');

      const result = await response.json();
      setResult(result);
      toast.success('SEO metadata generated successfully!');
    } catch (error) {
      toast.error('Failed to generate metadata. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title / Topic</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Ultimate Guide to React Hooks"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords</Label>
              <Input
                id="keywords"
                name="keywords"
                placeholder="e.g. react, hooks, javascript, frontend"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Content Summary</Label>
              <Textarea
                id="summary"
                name="summary"
                placeholder="Briefly describe what your content is about..."
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Metadata'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className={result ? 'opacity-100' : 'opacity-50'}>
        <CardHeader>
          <CardTitle>Generated Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Meta Title</Label>
              {result && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => copyToClipboard(result.title, 'title')}
                >
                  {copiedField === 'title' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <div className="p-3 rounded-md bg-muted min-h-[40px] text-sm">
              {result?.title || 'Generated title will appear here...'}
            </div>
            {result && (
              <p className="text-xs text-muted-foreground text-right">
                {result.title.length} chars
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Meta Description</Label>
              {result && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() =>
                    copyToClipboard(result.description, 'description')
                  }
                >
                  {copiedField === 'description' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <div className="p-3 rounded-md bg-muted min-h-[100px] text-sm">
              {result?.description ||
                'Generated description will appear here...'}
            </div>
            {result && (
              <p className="text-xs text-muted-foreground text-right">
                {result.description.length} chars
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
