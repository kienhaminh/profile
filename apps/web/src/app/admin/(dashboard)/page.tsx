'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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
import { authFetch, authDelete } from '@/lib/auth-client';
import type { PostWithTopics } from '@/services/posts';
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
  const [posts, setPosts] = useState<PostWithTopics[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithTopics | null>(null);
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
      logger.error('Failed to fetch posts:', err as Error);
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
      logger.error('Failed to fetch stats:', err as Error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const handleEdit = (postId: string) => {
    router.push(`/admin/blogs/${postId}`);
  };

  const handleDelete = (post: PostWithTopics) => {
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
      logger.error('Failed to delete post:', err as Error);
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.recentActivity.total_posts || posts.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.recentActivity.posts_this_week || 0} this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.recentActivity.total_projects || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.recentActivity.projects_this_week || 0} this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.recentActivity.total_topics || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {stats?.recentActivity.total_hashtags || 0}
              </div>
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
                              {post.topics.map((topic) => (
                                <span
                                  key={topic.id}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full"
                                >
                                  {topic.name}
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
