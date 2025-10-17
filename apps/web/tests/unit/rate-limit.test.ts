import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('rateLimit', () => {
    it('should allow requests within the limit', async () => {
      const config = { interval: 60000, maxRequests: 5 };

      const result1 = await rateLimit('user1', config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = await rateLimit('user1', config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests exceeding the limit', async () => {
      const config = { interval: 60000, maxRequests: 2 };

      await rateLimit('user2', config);
      await rateLimit('user2', config);

      const result = await rateLimit('user2', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after the time window expires', async () => {
      const config = { interval: 60000, maxRequests: 2 };

      await rateLimit('user3', config);
      await rateLimit('user3', config);
      const blockedResult = await rateLimit('user3', config);
      expect(blockedResult.success).toBe(false);

      // Advance time past the interval
      vi.advanceTimersByTime(61000);

      const result = await rateLimit('user3', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should track different identifiers separately', async () => {
      const config = { interval: 60000, maxRequests: 2 };

      await rateLimit('user4', config);
      await rateLimit('user4', config);

      const user4Result = await rateLimit('user4', config);
      expect(user4Result.success).toBe(false);

      const user5Result = await rateLimit('user5', config);
      expect(user5Result.success).toBe(true);
    });
  });

  describe('getRateLimitIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const identifier = getRateLimitIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should prioritize request.ip over headers', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.2',
          'x-forwarded-for': '192.168.1.3, 10.0.0.1',
        },
      });

      // Mock the ip property
      Object.defineProperty(request, 'ip', {
        value: '192.168.1.1',
        writable: false,
      });

      const identifier = getRateLimitIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should fall back to x-real-ip when request.ip is not available', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.2',
          'x-forwarded-for': '192.168.1.3, 10.0.0.1',
        },
      });

      const identifier = getRateLimitIdentifier(request);
      expect(identifier).toBe('192.168.1.2');
    });

    it('should return unknown when no IP available', () => {
      const request = new Request('http://localhost');

      const identifier = getRateLimitIdentifier(request);
      expect(identifier).toBe('unknown');
    });
  });
});
