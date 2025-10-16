import { describe, it, expect } from 'vitest';

describe('Admin Posts CRUD Contract', () => {
  const adminToken = 'mock-admin-token';

  it('should list posts for admin', async () => {
    const response = await fetch('/api/admin/posts', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should create new post', async () => {
    const newPost = {
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      status: 'draft',
      topics: ['AI']
    };

    const response = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(newPost)
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.title).toBe('Test Post');
  });

  it('should update existing post', async () => {
    const updateData = {
      title: 'Updated Post',
      content: 'Updated content',
      status: 'published'
    };

    const response = await fetch('/api/admin/posts/test-post', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(updateData)
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Updated Post');
  });

  it('should delete post', async () => {
    const response = await fetch('/api/admin/posts/test-post', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    expect(response.status).toBe(204);
  });
});