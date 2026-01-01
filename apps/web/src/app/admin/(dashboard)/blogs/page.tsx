'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { authFetch, authDelete } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/types/tag';
import { POST_STATUS, type PostStatus } from '@/types/enums';
import {
  Search,
  Plus,
  FileText,
  Sparkles,
  ArrowUpDown,
  Hash,
  FolderTree,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TagManager,
  type TagManagerHandle,
} from '@/components/admin/TagManager';

interface Blog {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  publishDate?: string;
  createdAt: string;
  topics: Tag[];
  hashtags?: Tag[];
}

type SortField = 'title' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function BlogsListContent() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    search: '',
  });
  const [searchInput, setSearchInput] = useState(filter.search);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter.status && filter.status !== 'all')
        params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);

      const response = await authFetch(`/api/admin/posts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch blogs');

      const data = await response.json();
      setBlogs(data?.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [filter.status, filter.search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Debounce search input changes
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setFilter((prev) => ({ ...prev, search: searchInput }));
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  // Keep search input in sync when filter changes externally
  useEffect(() => {
    setSearchInput(filter.search);
  }, [filter.search]);

  const handleDelete = (id: string, title: string) => {
    setBlogToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      const response = await authDelete(`/api/admin/posts/${blogToDelete.id}`);

      if (!response.ok) throw new Error('Failed to delete blog');

      setBlogs((prev) => prev.filter((blog) => blog.id !== blogToDelete.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedBlogs = [...blogs].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const LoadingSkeleton = () => (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Topics</TableHead>
                <TableHead className="font-semibold">Hashtags</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index} className="border-b">
                  <TableCell className="py-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex gap-1.5">
                      <Skeleton className="h-6 w-16 rounded-md" />
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex gap-1.5">
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const isFiltered = filter.status !== 'all' || searchInput !== '';

  const resetFilters = () => {
    setSearchInput('');
    setFilter({ status: 'all', search: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-col lg:flex-row items-end lg:items-center">
        <div className="flex-1 relative w-full group">
          <Input
            type="text"
            placeholder="Search blogs by title or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-11 pr-10 h-10 transition-all duration-200 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            aria-label="Search blogs"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <Select
            value={filter.status}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger
              className="w-full lg:w-[180px] bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={POST_STATUS.DRAFT}>Draft</SelectItem>
              <SelectItem value={POST_STATUS.PUBLISHED}>Published</SelectItem>
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedBlogs.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No blogs found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {filter.search || filter.status !== 'all'
                    ? "Try adjusting your filters to find what you're looking for"
                    : 'Get started by creating your first blog post'}
                </p>
              </div>
              <Button
                variant="default"
                asChild
                className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link
                  href="/admin/blogs/new"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Create your first blog post
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b">
                    <TableHead className="font-semibold">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        aria-label="Sort by title"
                      >
                        Title
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        aria-label="Sort by status"
                      >
                        Status
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">Topics</TableHead>
                    <TableHead className="font-semibold">Hashtags</TableHead>
                    <TableHead className="font-semibold">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        aria-label="Sort by created date"
                      >
                        Created
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBlogs.map((blog) => (
                    <TableRow
                      key={blog.id}
                      className="border-b hover:bg-muted/50 transition-all duration-200 group"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-muted rounded-md group-hover:bg-accent transition-colors shadow-sm">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 truncate">
                              {blog.title}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono truncate">
                              /{blog.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={
                            blog.status === POST_STATUS.PUBLISHED
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            blog.status === POST_STATUS.PUBLISHED
                              ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50 shadow-sm'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50 shadow-sm'
                          }
                        >
                          {blog.status.charAt(0).toUpperCase() +
                            blog.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {blog.topics?.map((topic) => (
                            <Badge
                              key={topic.id}
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 shadow-sm transition-colors"
                            >
                              {topic.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {blog.hashtags?.map((hashtag) => (
                            <Badge
                              key={hashtag.id}
                              variant="outline"
                              className="bg-secondary/10 text-secondary border-secondary/30 hover:bg-secondary/20 shadow-sm transition-colors"
                            >
                              {hashtag.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-primary/10 hover:border-primary hover:text-primary shadow-sm transition-all"
                          >
                            <Link href={`/admin/blogs/${blog.id}`}>Edit</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(blog.id, blog.title)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive shadow-sm transition-all"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete "${blogToDelete?.title}" and remove it from the server.`}
      />
    </div>
  );
}

export default function PostsPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const hashtagManagerRef = useRef<TagManagerHandle>(null);
  const topicManagerRef = useRef<TagManagerHandle>(null);

  const handleAdd = () => {
    if (activeTab === 'hashtags') {
      hashtagManagerRef.current?.handleAdd();
    } else if (activeTab === 'topics') {
      topicManagerRef.current?.handleAdd();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Blogs</h1>
        <p className="text-muted-foreground">
          Manage your posts, hashtags, and topics
        </p>
      </div>

      <Tabs
        defaultValue="posts"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList className="mb-0">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Hashtags
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              Topics
            </TabsTrigger>
          </TabsList>

          {activeTab === 'posts' ? (
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/admin/blogs/new" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Blog
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handleAdd}
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === 'hashtags' ? 'Hashtag' : 'Topic'}
            </Button>
          )}
        </div>

        <TabsContent value="posts">
          <BlogsListContent />
        </TabsContent>

        <TabsContent value="hashtags">
          <TagManager
            ref={hashtagManagerRef}
            type="hashtags"
            icon={<Hash className="w-6 h-6" />}
            title="Hashtags"
            description="Manage hashtags for your content"
          />
        </TabsContent>

        <TabsContent value="topics">
          <TagManager
            ref={topicManagerRef}
            type="topics"
            icon={<FolderTree className="w-6 h-6" />}
            title="Topics"
            description="Manage topics for your content"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
