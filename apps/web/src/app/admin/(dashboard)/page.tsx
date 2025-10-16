import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db';
import { posts as postsTable, postTopics, topics } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishDate: string | null;
  topics: Array<{ topic: { name: string } }>;
}

async function getPosts(): Promise<Post[]> {
  const allPosts = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      slug: postsTable.slug,
      status: postsTable.status,
      publishDate: postsTable.publishDate,
    })
    .from(postsTable);

  const postsWithTopics = await Promise.all(
    allPosts.map(async (post) => {
      const postTopicsData = await db
        .select({
          topic: {
            name: topics.name,
          },
        })
        .from(postTopics)
        .innerJoin(topics, eq(postTopics.topicId, topics.id))
        .where(eq(postTopics.postId, post.id));

      return {
        ...post,
        publishDate: post.publishDate ? post.publishDate.toISOString() : null,
        topics: postTopicsData,
      };
    })
  );

  return postsWithTopics;
}

export default async function AdminDashboard() {
  const posts = await getPosts();
  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED').length;
  const draftPosts = posts.filter((p) => p.status === 'DRAFT').length;

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
