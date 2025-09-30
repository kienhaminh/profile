import { describe, it, expect } from 'vitest';

interface PostResponse {
  status: string;
  topics?: string[];
}

describe('Public Blog API Contract', () => {
  it('should list published posts', async () => {
    const response = await fetch('/api/blog/posts');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // All posts should be published
    data.forEach((post: PostResponse) => {
      expect(post.status).toBe('published');
    });
  });

  it('should filter posts by topic', async () => {
    const response = await fetch('/api/blog/posts?topic=AI');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // All posts should have AI topic
    data.forEach((post: PostResponse) => {
      expect(post.topics).toContain('AI');
    });
  });

  it('should get post by slug', async () => {
    const response = await fetch('/api/blog/posts/test-post');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('content');
    expect(data).toHaveProperty('slug', 'test-post');
    expect(data.status).toBe('published');
  });

  it('should return 404 for non-existent post', async () => {
    const response = await fetch('/api/blog/posts/non-existent');

    expect(response.status).toBe(404);
  });
});
