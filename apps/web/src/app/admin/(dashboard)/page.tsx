'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  FolderKanban,
  FolderTree,
  Hash,
  TrendingUp,
} from 'lucide-react';
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
import { logger } from '@/lib/logger';
import { authFetch, authDelete } from '@/lib/auth';
import type { Blog } from '@/types/blog';
import { PostsOverTimeChart } from '@/components/admin/posts-over-time-chart';
import { TopicsDistributionChart } from '@/components/admin/topics-distribution-chart';
import { HashtagsDistributionChart } from '@/components/admin/hashtags-distribution-chart';
import { ProjectsStatsChart } from '@/components/admin/projects-stats-chart';

interface DashboardStats {
  postsOverTime: Array<{ month: string; count: string; status: string }>;
  topicsDistribution: Array<{ name: string; post_count: string }>;
  hashtagsDistribution: Array<{
    name: string;
    post_count: string;
    project_count: string;
  }>;
  projectsStats: Array<{ status: string; count: string }>;
  recentActivity: {
    posts_this_week: string;
    projects_this_week: string;
    total_posts: string;
    total_projects: string;
    total_topics: string;
    total_hashtags: string;
  };
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Blog | null>(null);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authFetch('/api/admin/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      logger.error('Failed to fetch posts', { error: err });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authFetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      logger.error('Failed to fetch stats', { error: err });
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const handleEdit = (postId: string) => {
    router.push(`/admin/blogs/${postId}`);
  };

  const handleDelete = (post: Blog) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    setDeletingPostId(postToDelete.id);
    try {
      const response = await authDelete(
        `/api/admin/posts/${postToDelete.slug}`
      );

      if (!response.ok) throw new Error('Failed to delete post');

      // Remove the post from state
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      logger.error('Failed to delete post', { error: err });
    } finally {
      setDeletingPostId(null);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your blog posts and content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Posts
                </CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats?.recentActivity.total_posts || posts.length}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-gray-600 font-medium">
                  {stats?.recentActivity.posts_this_week || 0} this week
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Projects
                </CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {stats?.recentActivity.total_projects || 0}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-gray-600 font-medium">
                  {stats?.recentActivity.projects_this_week || 0} this week
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Topics
                </CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FolderTree className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats?.recentActivity.total_topics || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Content categories
              </p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Hashtags
                </CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stats?.recentActivity.total_hashtags || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Content tags
              </p>
            </CardContent>
          </Card>
        </div>

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PostsOverTimeChart data={stats.postsOverTime} />
            <ProjectsStatsChart data={stats.projectsStats} />
            <TopicsDistributionChart data={stats.topicsDistribution} />
            <HashtagsDistributionChart data={stats.hashtagsDistribution} />
          </div>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Skeleton className="h-6 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-1/2 mb-2" />
                              <div className="flex gap-2">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Skeleton className="h-8 w-16" />
                              <Skeleton className="h-8 w-16" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              /{post.slug}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  post.status === 'PUBLISHED'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                }`}
                              >
                                {post.status}
                              </span>
                              {post.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full"
                                >
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(post.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(post)}
                              disabled={deletingPostId === post.id}
                            >
                              {deletingPostId === post.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                {posts.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No posts found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete &ldquo;
              {postToDelete?.title}&rdquo; and remove it from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingPostId === postToDelete?.id}
            >
              {deletingPostId === postToDelete?.id ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
