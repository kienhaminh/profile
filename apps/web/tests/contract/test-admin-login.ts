import { describe, it, expect } from 'vitest';

describe('Admin Login Contract', () => {
  it('should accept valid login credentials', async () => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('token');
  });

  it('should reject invalid credentials', async () => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'wrong',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should require both username and password', async () => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        // missing password
      }),
    });

    expect(response.status).toBe(400);
  });
});
