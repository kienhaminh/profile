'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { authFetch, authDelete } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/types/tag';
import { POST_STATUS, type PostStatus } from '@/types/enums';
import { Search, Plus, FileText, Sparkles, ArrowUpDown } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Skeleton } from '@/components/ui/skeleton';

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

export default function BlogsListPage() {
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
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const LoadingSkeleton = () => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-b border-purple-200/50">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Topics</TableHead>
                <TableHead className="font-semibold">Hashtags</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index} className="border-b border-purple-100/50">
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Blog Posts
          </h1>
          <p className="text-muted-foreground mt-1">Manage and organize your content</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
        >
          <Link
            href="/admin/blogs/new"
            className="flex items-center gap-2 text-white"
          >
            <Plus className="w-4 h-4" />
            Create New Blog
          </Link>
        </Button>
      </div>

      <Card className="mb-6 border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search blogs by title or slug..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 transition-all duration-200"
                aria-label="Search blogs"
              />
            </div>
            <Select
              value={filter.status}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={POST_STATUS.DRAFT}>Draft</SelectItem>
                <SelectItem value={POST_STATUS.PUBLISHED}>Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mb-6 border-destructive/50 bg-destructive/10">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedBlogs.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center">
                <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
              >
                <Link
                  href="/admin/blogs/new"
                  className="flex items-center gap-2 text-white"
                >
                  <Sparkles className="w-4 h-4" />
                  Create your first blog post
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-purple-100/50 dark:border-purple-900/50 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-950 dark:to-purple-950/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/50 dark:to-blue-950/50 border-b border-purple-200/50 dark:border-purple-800/50">
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
                    <TableHead className="font-semibold">
                      Topics
                    </TableHead>
                    <TableHead className="font-semibold">
                      Hashtags
                    </TableHead>
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
                      className="border-b border-purple-100/50 dark:border-purple-900/50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/30 dark:hover:from-purple-950/50 dark:hover:to-blue-950/30 transition-all duration-200 hover:shadow-md group"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-md group-hover:from-purple-200 group-hover:to-blue-200 dark:group-hover:from-purple-800 dark:group-hover:to-blue-800 transition-colors shadow-sm">
                            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors mb-1 truncate">
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
                              ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700 shadow-sm'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700 shadow-sm'
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
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 shadow-sm transition-colors"
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
                              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 shadow-sm transition-colors"
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
                            className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:border-purple-700 dark:hover:text-purple-300 shadow-sm transition-all"
                          >
                            <Link href={`/admin/blogs/${blog.id}`}>Edit</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(blog.id, blog.title)}
                            className="text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950 dark:hover:border-red-700 shadow-sm transition-all"
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete &ldquo;
              {blogToDelete?.title}&rdquo; and remove it from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
