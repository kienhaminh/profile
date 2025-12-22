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
    query: {
      financeCategories: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      financeTransactions: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      financeBudgets: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  },
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { requireAdminAuth } from '@/lib/server-auth';
import { UnauthorizedError } from '@/lib/errors';
import {
  createCategory,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createOrUpdateBudget,
  deleteBudget,
} from '@/app/actions/finance';

describe('finance.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication protection', () => {
    it('createCategory should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(createCategory('Food')).rejects.toThrow(
        'Authentication required'
      );

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it('createTransaction should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(
        createTransaction({
          type: 'expense',
          amount: 100,
          currency: 'KRW',
          date: new Date(),
        })
      ).rejects.toThrow('Authentication required');

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it('updateTransaction should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(
        updateTransaction({
          id: 'test-id',
          amount: 200,
        })
      ).rejects.toThrow('Authentication required');

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it('deleteTransaction should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(deleteTransaction('test-id')).rejects.toThrow(
        'Authentication required'
      );

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it('createOrUpdateBudget should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(
        createOrUpdateBudget({
          categoryId: 'cat-1',
          amount: 500,
          currency: 'KRW',
          month: '2024-01-01',
        })
      ).rejects.toThrow('Authentication required');

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it('deleteBudget should throw when unauthenticated', async () => {
      vi.mocked(requireAdminAuth).mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );

      await expect(deleteBudget('test-id')).rejects.toThrow(
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

    it('createCategory should succeed when authenticated', async () => {
      const result = await createCategory('Food');

      expect(requireAdminAuth).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('createTransaction should succeed when authenticated', async () => {
      const result = await createTransaction({
        type: 'expense',
        amount: 100,
        currency: 'KRW',
        date: new Date(),
      });

      expect(requireAdminAuth).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
