import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock auth library
vi.mock('@/lib/auth', () => ({
  verifyAdminToken: vi.fn(),
}));

// Mock errors library
vi.mock('@/lib/errors', () => ({
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'UnauthorizedError';
    }
  },
}));

import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { getServerAuth, requireAdminAuth } from '@/lib/server-auth';

describe('server-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getServerAuth', () => {
    it('should return unauthenticated when no token is present', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await getServerAuth();

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
    });

    it('should authenticate with valid static token', async () => {
      const originalToken = process.env.ADMIN_API_TOKEN;
      process.env.ADMIN_API_TOKEN = 'test-static-token';

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'test-static-token' }),
      } as any);

      const result = await getServerAuth();

      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual({ id: 'admin', role: 'admin' });

      process.env.ADMIN_API_TOKEN = originalToken;
    });

    it('should authenticate with valid JWT token', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'valid-jwt-token' }),
      } as any);

      vi.mocked(verifyAdminToken).mockReturnValue({
        adminId: 'user-123',
        username: 'testuser',
        iat: 1234567890,
        exp: 1234571490,
      });

      const result = await getServerAuth();

      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual({ id: 'user-123', role: 'admin' });
    });

    it('should return unauthenticated for invalid JWT token', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'invalid-token' }),
      } as any);

      vi.mocked(verifyAdminToken).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await getServerAuth();

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
    });
  });

  describe('requireAdminAuth', () => {
    it('should throw UnauthorizedError when not authenticated', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      await expect(requireAdminAuth()).rejects.toThrow(
        'Authentication required'
      );
    });

    it('should throw UnauthorizedError when token is invalid', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'invalid-token' }),
      } as any);

      vi.mocked(verifyAdminToken).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(requireAdminAuth()).rejects.toThrow(
        'Authentication required'
      );
    });

    it('should return user when authenticated as admin', async () => {
      const originalToken = process.env.ADMIN_API_TOKEN;
      process.env.ADMIN_API_TOKEN = 'test-static-token';

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'test-static-token' }),
      } as any);

      const result = await requireAdminAuth();

      expect(result).toEqual({ id: 'admin', role: 'admin' });

      process.env.ADMIN_API_TOKEN = originalToken;
    });

    it('should return user info from JWT when authenticated', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'valid-jwt-token' }),
      } as any);

      vi.mocked(verifyAdminToken).mockReturnValue({
        adminId: 'user-456',
        username: 'testadmin',
        iat: 1234567890,
        exp: 1234571490,
      });

      const result = await requireAdminAuth();

      expect(result).toEqual({ id: 'user-456', role: 'admin' });
    });
  });
});
