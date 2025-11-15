'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { authFetch, authDelete } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/types/tag';
import { POST_STATUS, type PostStatus } from '@/types/enums';
import { Search, Plus, FileText, Sparkles } from 'lucide-react';
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

export default function BlogsListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    search: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

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

  console.log(blogs);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Blog Posts
          </h1>
          <p className="text-gray-600 mt-1">Manage and organize your content</p>
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
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search blogs by title or slug..."
                value={filter.search}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <Select
              value={filter.status}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-[200px] border-gray-300 focus:ring-2 focus:ring-blue-500">
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
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading blogs...</p>
            </div>
          </CardContent>
        </Card>
      ) : blogs.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
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
        <Card className="border-2 border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-purple-50/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-b border-purple-200/50">
                    <TableHead className="font-semibold text-gray-700">
                      Title
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Topics
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Hashtags
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Created
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow
                      key={blog.id}
                      className="border-b border-purple-100/50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/30 transition-all duration-200 hover:shadow-md group"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-gradient-to-br from-purple-100 to-blue-100 rounded-md group-hover:from-purple-200 group-hover:to-blue-200 transition-colors shadow-sm">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                              {blog.title}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
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
                              ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 shadow-sm'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 shadow-sm'
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
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-sm transition-colors"
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
                              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 shadow-sm transition-colors"
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
                            className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 shadow-sm transition-all"
                          >
                            <Link href={`/admin/blogs/${blog.id}`}>Edit</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(blog.id, blog.title)}
                            className="text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-300 shadow-sm transition-all"
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
