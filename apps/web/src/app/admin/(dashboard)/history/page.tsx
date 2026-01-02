'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { crawlFolktales, searchFolktales } from '@/actions/folktales-crawler';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

type CrawlResult = {
  success: boolean;
  message: string;
  count?: number;
  stories?: { title: string; summary: string }[];
};

export default function FolktalesCrawlerPage() {
  const [keyword, setKeyword] = useState('truyện cổ tích Việt Nam');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);

  const handleListCrawl = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await crawlFolktales();
      setResult(res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCrawl = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await searchFolktales(keyword);
      setResult(res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Folktales Crawler
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
              <span className="text-[10px] font-medium text-yellow-500 uppercase tracking-wide">
                Crawler
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Crawl Vietnamese fairy tales, fables, and legends from the web.
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            List Crawl
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Keyword Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Crawl from Wikipedia List</CardTitle>
              <CardDescription>
                Crawl folktales from the official Vietnamese Wikipedia folktale
                list page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleListCrawl}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Crawling...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start List Crawl
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search by Keyword</CardTitle>
              <CardDescription>
                Search Wikipedia for folktales matching your keyword.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="e.g., truyện cổ tích, Thánh Gióng, Sơn Tinh..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSearchCrawl} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                result.success
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {result.success ? 'Success' : 'Error'}
                </p>
                <p className="text-sm">{result.message}</p>

                {result.stories && result.stories.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Stories found:</p>
                    <ul className="text-sm space-y-1 max-h-60 overflow-y-auto">
                      {result.stories.map((story, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span className="font-medium">{story.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
