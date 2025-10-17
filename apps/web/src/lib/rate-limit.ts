import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests in the time window
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

// Create Redis client instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Error types for better error handling
class RateLimitStoreError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'RateLimitStoreError';
  }
}

// Fallback policy types
type FallbackPolicy = 'permissive' | 'conservative';

const FALLBACK_POLICY: FallbackPolicy =
  (process.env.RATE_LIMIT_FALLBACK_POLICY as FallbackPolicy) || 'permissive';

// Fallback in-memory store for when Redis is unavailable
const fallbackStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();

  try {
    // Try to get current count from Redis
    const currentCount = await redis.get<number>(key);

    if (currentCount === null) {
      // First request for this identifier - set initial count to 1 with TTL
      const resetTime = now + config.interval;

      try {
        await redis.set(key, 1, { ex: Math.ceil(config.interval / 1000) });
        return {
          success: true,
          remaining: config.maxRequests - 1,
          resetTime,
        };
      } catch (redisError) {
        throw new RateLimitStoreError(
          `Failed to set initial rate limit counter in Redis: ${redisError instanceof Error ? redisError.message : 'Unknown error'}`,
          redisError instanceof Error ? redisError : undefined
        );
      }
    }

    if (currentCount >= config.maxRequests) {
      // Get TTL to determine reset time
      const ttl = await redis.ttl(key);
      const resetTime = ttl > 0 ? now + ttl * 1000 : now + config.interval;

      return {
        success: false,
        remaining: 0,
        resetTime,
      };
    }

    // Increment counter atomically
    const newCount = await redis.incr(key);

    // Set TTL if this is the first increment (TTL might have expired)
    if (newCount === 1) {
      await redis.expire(key, Math.ceil(config.interval / 1000));
    }

    const resetTime = now + config.interval;

    return {
      success: true,
      remaining: Math.max(0, config.maxRequests - newCount),
      resetTime,
    };
  } catch (error) {
    // Handle Redis errors with fallback policy
    console.warn(
      `[rate-limit] Redis error, falling back to ${FALLBACK_POLICY} policy:`,
      error
    );

    return await fallbackRateLimit(identifier, config, now);
  }
}

// Fallback rate limiting implementation for when Redis is unavailable
async function fallbackRateLimit(
  identifier: string,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitResult> {
  const key = identifier;

  // Lazy cleanup: purge expired entries before processing
  for (const [storeKey, value] of fallbackStore.entries()) {
    if (now > value.resetTime) {
      fallbackStore.delete(storeKey);
    }
  }

  const existing = fallbackStore.get(key);

  if (!existing || now > existing.resetTime) {
    const resetTime = now + config.interval;
    fallbackStore.set(key, { count: 1, resetTime });

    if (FALLBACK_POLICY === 'permissive') {
      // Permissive: Allow the request but log the issue
      console.warn(
        `[rate-limit] Using fallback store for ${identifier} - Redis unavailable`
      );
      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime,
      };
    } else {
      // Conservative: Block the request to be safe
      console.warn(
        `[rate-limit] Blocking request for ${identifier} - Redis unavailable (conservative policy)`
      );
      return {
        success: false,
        remaining: 0,
        resetTime,
      };
    }
  }

  if (existing.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;
  fallbackStore.set(key, existing);

  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime,
  };
}

export function getRateLimitIdentifier(request: Request): string {
  // Use Vercel's trusted IP (available in request object)
  // @ts-expect-error - ip property exists on Vercel Request
  const ip =
    request.ip ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    'unknown';
  return ip;
}

// Configuration function to update fallback policy
export function setFallbackPolicy(policy: FallbackPolicy): void {
  if (policy !== 'permissive' && policy !== 'conservative') {
    throw new Error(
      `Invalid fallback policy: ${policy}. Must be 'permissive' or 'conservative'`
    );
  }
  // Note: This would need to be stored in a way that persists across function calls
  // For now, we'll use the environment variable approach
}

// Health check function to verify Redis connectivity
export async function checkRateLimitHealth(): Promise<{
  healthy: boolean;
  error?: string;
}> {
  try {
    // Simple ping to check Redis connectivity
    await redis.ping();
    return { healthy: true };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}
