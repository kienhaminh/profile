import { describe, it, expect } from 'vitest';

describe('GA4 Metrics Integration', () => {
  it('should display GA4 metrics in admin dashboard', async () => {
    // 1. Login as admin
    const loginResponse = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123'
      })
    });
    expect(loginResponse.status).toBe(200);
    const { token } = await loginResponse.json();

    // 2. Access admin dashboard metrics
    const metricsResponse = await fetch('/api/admin/metrics', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    expect(metricsResponse.status).toBe(200);
    const metrics = await metricsResponse.json();
    
    // Should have basic metrics structure
    expect(metrics).toHaveProperty('pageViews');
    expect(metrics).toHaveProperty('posts');
    expect(metrics).toHaveProperty('topics');
    
    // Metrics should be arrays or objects with data
    expect(Array.isArray(metrics.posts) || typeof metrics.posts === 'object').toBe(true);
  });

  it('should track page views for blog posts', async () => {
    // Simulate viewing a blog post
    const response = await fetch('/api/blog/posts/test-post');
    expect(response.status).toBe(200);
    
    // In a real implementation, this would trigger GA4 tracking
    // For now, we just verify the endpoint works
    const post = await response.json();
    expect(post).toHaveProperty('title');
  });
});