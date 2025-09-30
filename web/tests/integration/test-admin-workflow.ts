import { describe, it, expect } from 'vitest';

interface PostData {
  slug: string;
  status: string;
}

describe('Admin Workflow Integration', () => {
  it('should allow admin to create draft, then publish post', async () => {
    // 1. Login as admin
    const loginResponse = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
      }),
    });
    expect(loginResponse.status).toBe(200);
    const { token } = await loginResponse.json();

    // 2. Create draft post
    const draftPost = {
      title: 'Draft Post',
      slug: 'draft-post',
      content: 'Draft content',
      status: 'draft',
      topics: ['AI'],
    };

    const createResponse = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(draftPost),
    });
    expect(createResponse.status).toBe(201);

    // 3. Verify draft is not visible publicly
    const publicResponse = await fetch('/api/blog/posts');
    const publicPosts = await publicResponse.json();
    expect(
      publicPosts.find((p: PostData) => p.slug === 'draft-post')
    ).toBeUndefined();

    // 4. Publish the post
    const publishResponse = await fetch('/api/admin/posts/draft-post', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'published' }),
    });
    expect(publishResponse.status).toBe(200);

    // 5. Verify post is now visible publicly
    const publicResponse2 = await fetch('/api/blog/posts');
    const publicPosts2 = await publicResponse2.json();
    const publishedPost = publicPosts2.find(
      (p: PostData) => p.slug === 'draft-post'
    );
    expect(publishedPost).toBeDefined();
    expect(publishedPost?.status).toBe('published');
  });
});
