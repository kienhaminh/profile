import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('rateLimit', () => {
    it('should allow requests within the limit', () => {
      const config = { interval: 60000, maxRequests: 5 };

      const result1 = rateLimit('user1', config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = rateLimit('user1', config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests exceeding the limit', () => {
      const config = { interval: 60000, maxRequests: 2 };

      rateLimit('user2', config);
      rateLimit('user2', config);

      const result = rateLimit('user2', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after the time window expires', () => {
      const config = { interval: 60000, maxRequests: 2 };

      rateLimit('user3', config);
      rateLimit('user3', config);
      const blockedResult = rateLimit('user3', config);
      expect(blockedResult.success).toBe(false);

      // Advance time past the interval
      vi.advanceTimersByTime(61000);

      const result = rateLimit('user3', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should track different identifiers separately', () => {
      const config = { interval: 60000, maxRequests: 2 };

      rateLimit('user4', config);
      rateLimit('user4', config);

      const user4Result = rateLimit('user4', config);
      expect(user4Result.success).toBe(false);

      const user5Result = rateLimit('user5', config);
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

    it('should return unknown when no IP available', () => {
      const request = new Request('http://localhost');

      const identifier = getRateLimitIdentifier(request);
      expect(identifier).toBe('unknown');
    });
  });
});
