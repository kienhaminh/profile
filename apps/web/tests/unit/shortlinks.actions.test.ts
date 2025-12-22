import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock server-auth - must be before importing the actions
vi.mock('@/lib/server-auth', () => ({
  requireAdminAuth: vi.fn(),
}));

// Mock database client
vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'abc123'),
}));

import { requireAdminAuth } from '@/lib/server-auth';
import { UnauthorizedError } from '@/lib/errors';
import {
  createShortlink,
  updateShortlink,
  deleteShortlink,
  toggleShortlinkStatus,
} from '@/actions/shortlinks';

describe('shortlinks.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication protection', () => {
    it('createShortlink should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(
        createShortlink({ destinationUrl: 'https://example.com' })
      ).rejects.toThrow('Authentication required');

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it('updateShortlink should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(
        updateShortlink('test-id', { destinationUrl: 'https://example.com' })
      ).rejects.toThrow('Authentication required');

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it('deleteShortlink should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(deleteShortlink('test-id')).rejects.toThrow(
        'Authentication required'
      );

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it('toggleShortlinkStatus should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(toggleShortlinkStatus('test-id')).rejects.toThrow(
        'Authentication required'
      );

      expect(requireAdminAuth).toHaveBeenCalled();
    });
  });

  describe('Authenticated operations', () => {
    beforeEach(() => {
      vi.mocked(requireAdminAuth).mockResolvedValue({
        id: 'admin-1',
        role: 'admin',
      });
    });

    it('createShortlink should succeed when authenticated', async () => {
      const result = await createShortlink({
        destinationUrl: 'https://example.com',
      });

      expect(requireAdminAuth).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('deleteShortlink should succeed when authenticated', async () => {
      const { db } = await import('@/db/client');
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
        }),
      } as any);

      const result = await deleteShortlink('test-id');

      expect(requireAdminAuth).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
