'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  FolderKanban,
  FolderTree,
  Hash,
  TrendingUp,
  Calendar,
  ChevronDown,
  Download,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { logger } from '@/lib/logger';
import { authDelete } from '@/lib/auth';
import type { Blog } from '@/types/blog';
import { PostsOverTimeChart } from '@/components/admin/PostsOverTimeChart';
import { ProjectsStatsChart } from '@/components/admin/ProjectsStatsChart';
import { formatDistanceToNow } from 'date-fns';
import { useAdminPosts, useAdminStats } from '@/hooks/admin';

export default function AdminDashboard() {
  // SWR hooks for data fetching
  const { posts, isLoading, error, mutate: mutatePosts } = useAdminPosts();
  const { stats } = useAdminStats();

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Blog | null>(null);
  const router = useRouter();

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

      // Revalidate posts using SWR mutate
      mutatePosts();
    } catch (err) {
      logger.error('Failed to delete post', { error: err });
    } finally {
      setDeletingPostId(null);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Dashboard Overview
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wide">
                System Online
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Welcome back to your command center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Custom Date Picker Trigger */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded hover:bg-accent hover:text-foreground transition-all">
            <Calendar className="w-3.5 h-3.5" />
            Last 30 Days
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
          <button className="flex items-center justify-center w-8 h-8 text-muted-foreground bg-card border border-border rounded hover:bg-foreground hover:text-background hover:border-foreground transition-all">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Total Posts */}
        <div className="p-5 rounded-xl bg-card border border-border/60 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-accent/50 border border-border rounded-md text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <TrendingUp className="w-2.5 h-2.5" />
              {stats?.recentActivity.posts_this_week || 0} new
            </span>
          </div>
          <div className="text-muted-foreground text-xs font-medium mb-1">
            Total Posts
          </div>
          <div className="text-2xl font-semibold text-foreground tracking-tight">
            {stats?.recentActivity.total_posts || posts.length}
          </div>
        </div>

        {/* Metric Card 2: Total Projects */}
        <div className="p-5 rounded-xl bg-card border border-border/60 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-accent/50 border border-border rounded-md text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <TrendingUp className="w-2.5 h-2.5" />
              {stats?.recentActivity.projects_this_week || 0} new
            </span>
          </div>
          <div className="text-muted-foreground text-xs font-medium mb-1">
            Total Projects
          </div>
          <div className="text-2xl font-semibold text-foreground tracking-tight">
            {stats?.recentActivity.total_projects || 0}
          </div>
        </div>

        {/* Metric Card 3: Topics */}
        <div className="p-5 rounded-xl bg-card border border-border/60 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-accent/50 border border-border rounded-md text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-muted-foreground text-xs font-medium mb-1">
            Total Topics
          </div>
          <div className="text-2xl font-semibold text-foreground tracking-tight">
            {stats?.recentActivity.total_topics || 0}
          </div>
        </div>

        {/* Metric Card 4: Hashtags */}
        <div className="p-5 rounded-xl bg-card border border-border/60 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-accent/50 border border-border rounded-md text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-colors">
              <Hash className="w-4 h-4" />
            </div>
          </div>
          <div className="text-muted-foreground text-xs font-medium mb-1">
            Total Hashtags
          </div>
          <div className="text-2xl font-semibold text-foreground tracking-tight">
            {stats?.recentActivity.total_hashtags || 0}
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full bg-card border border-border/60 rounded-xl p-1 overflow-hidden">
            <PostsOverTimeChart data={stats.postsOverTime} />
          </div>
          <div className="space-y-6">
            <div className="w-full bg-card border border-border/60 rounded-xl p-1 overflow-hidden">
              <ProjectsStatsChart data={stats.projectsStats} />
            </div>
          </div>
        </div>
      )}

      {/* Activity Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Recent Posts
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest blog posts and updates
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/blogs')}
            className="text-xs text-muted-foreground hover:text-foreground h-auto p-0 hover:bg-transparent"
          >
            View All
          </Button>
        </div>

        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs text-muted-foreground font-medium">
                  <th className="px-6 py-3 font-medium">Post</th>
                  <th className="px-6 py-3 font-medium">Tags</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Updated</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-10 w-48" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No posts found
                    </td>
                  </tr>
                ) : (
                  posts.slice(0, 10).map((post) => (
                    <tr
                      key={post.id}
                      className="group hover:bg-accent/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-accent/50 border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-foreground font-medium text-xs line-clamp-1">
                              {post.title}
                            </div>
                            <div className="text-muted-foreground text-[10px] font-mono">
                              /{post.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground border border-border"
                            >
                              <Hash className="w-3 h-3 mr-0.5 opacity-50" />
                              {tag.label}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              post.status === 'PUBLISHED'
                                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                : 'bg-amber-500'
                            }`}
                          ></div>
                          <span
                            className={`text-xs ${
                              post.status === 'PUBLISHED'
                                ? 'text-emerald-500'
                                : 'text-amber-500'
                            }`}
                          >
                            {post.status.charAt(0) +
                              post.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.updatedAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEdit(post.id)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
