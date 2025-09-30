'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishDate: string | null;
  topics: Array<{ topic: { name: string } }>;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin-token');
    if (storedToken) {
      setToken(storedToken);
      fetchPosts(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPosts = async (authToken: string) => {
    try {
      const response = await fetch('/api/admin/posts', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('admin-token', data.token);
        fetchPosts(data.token);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleLogin}
              className="space-y-4"
              aria-label="Admin login form"
            >
              <div>
                <label htmlFor="username" className="block text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  aria-required="true"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                aria-label="Submit login"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED').length;
  const draftPosts = posts.filter((p) => p.status === 'DRAFT').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your blog posts and content</p>
        </div>

        {/* KPI Metrics */}
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
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-gray-600">/{post.slug}</p>
                        <div className="flex gap-2 mt-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              post.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {post.status}
                          </span>
                          {post.topics.map(({ topic }) => (
                            <span
                              key={topic.name}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {topic.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
