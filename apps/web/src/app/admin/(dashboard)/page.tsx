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
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
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
      setPosts(data.items);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your blog posts and content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="cosmic-card relative overflow-hidden border shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Posts
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-400 dark:to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
              {stats?.recentActivity.total_posts || posts.length}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <p className="text-xs text-muted-foreground font-medium">
                {stats?.recentActivity.posts_this_week || 0} this week
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="cosmic-card relative overflow-hidden border shadow-lg hover:shadow-xl dark:hover:shadow-secondary/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 dark:from-cyan-400 dark:to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
              {stats?.recentActivity.total_projects || 0}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <p className="text-xs text-muted-foreground font-medium">
                {stats?.recentActivity.projects_this_week || 0} this week
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="cosmic-card relative overflow-hidden border shadow-lg hover:shadow-xl dark:hover:shadow-accent/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Topics
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 dark:from-violet-400 dark:to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderTree className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {stats?.recentActivity.total_topics || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Content categories
            </p>
          </CardContent>
        </Card>
        <Card className="cosmic-card relative overflow-hidden border shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hashtags
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Hash className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-500 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
              {stats?.recentActivity.total_hashtags || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
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
        <Card className="cosmic-card border-2 hover:border-primary transition-all duration-300">
          <CardHeader className="border-b bg-accent/30 dark:bg-accent/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 dark:from-primary dark:to-secondary rounded-lg shadow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Blog Posts
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/blogs')}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                View All
              </Button>
            </div>
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
                  <Card
                    key={post.id}
                    className="hover:shadow-md transition-all duration-200 border hover:border-primary group"
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-1.5 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-md group-hover:from-primary/20 group-hover:to-secondary/20 dark:group-hover:from-primary/30 dark:group-hover:to-secondary/30 transition-colors">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                {post.title}
                              </h3>
                              <p className="text-sm text-muted-foreground font-mono mb-3">
                                /{post.slug}
                              </p>
                              <div className="flex flex-wrap gap-2 items-center">
                                <span
                                  className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                                    post.status === 'PUBLISHED'
                                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30'
                                      : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30'
                                  }`}
                                >
                                  {post.status}
                                </span>
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="px-2.5 py-1 text-xs text-muted-foreground">
                                    +{post.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(post.id)}
                            className="hover:bg-primary/10 hover:border-primary hover:text-primary"
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

      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete "${postToDelete?.title}" and remove it from the server.`}
        isLoading={deletingPostId === postToDelete?.id}
      />
    </div>
  );
}
