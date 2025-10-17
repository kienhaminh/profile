'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { authFetch, authDelete } from '@/lib/auth-client';
import type { PostWithTopics } from '@/services/posts';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<PostWithTopics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (postId: string) => {
    router.push(`/admin/blogs/${postId}`);
  };

  const handleDelete = async (post: PostWithTopics) => {
    if (
      !confirm(
        `Are you sure you want to delete "${post.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingPostId(post.id);
    try {
      const response = await authDelete(`/api/admin/posts/${post.slug}`);

      if (!response.ok) throw new Error('Failed to delete post');

      // Remove the post from state
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      alert(`Error: ${errorMessage}`);
      logger.error('Failed to delete post:', err as Error);
    } finally {
      setDeletingPostId(null);
    }
  };

  const publishedPosts = posts.filter((p) => p.status === 'published').length;
  const draftPosts = posts.filter((p) => p.status === 'draft').length;

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
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {publishedPosts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {draftPosts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                View in{' '}
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GA4
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-gray-500 text-center py-8">
                    Loading posts...
                  </p>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{post.title}</h3>
                          <p className="text-sm text-gray-600">/{post.slug}</p>
                          <div className="flex gap-2 mt-2">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                post.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {post.status}
                            </span>
                            {post.topics.map(({ topic }) => (
                              <span
                                key={topic.id}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
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
                    </div>
                  ))
                )}
                {posts.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No posts found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
