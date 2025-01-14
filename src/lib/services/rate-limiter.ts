import { Redis } from 'ioredis';
import { Logger } from './logger';
import { PlatformError } from '../utils/errors';

interface RateLimitConfig {
  points: number;      // Number of requests allowed
  duration: number;    // Time window in seconds
  blockDuration?: number; // Duration to block if limit exceeded (optional)
}

interface RateLimitInfo {
  remaining: number;   // Remaining points
  resetTime: Date;     // When the limit resets
  blocked: boolean;    // Whether the client is blocked
}

export class RateLimiter {
  private redis: Redis;
  private logger: Logger;
  private defaultConfig: RateLimitConfig = {
    points: 60,        // 60 requests
    duration: 60,      // per 60 seconds
    blockDuration: 300 // block for 5 minutes if exceeded
  };

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
    this.logger = Logger.getInstance();
  }

  /**
   * Consume a point from the rate limit
   */
  async consume(
    key: string,
    config: RateLimitConfig = this.defaultConfig
  ): Promise<RateLimitInfo> {
    const { points, duration, blockDuration } = config;
    const now = Date.now();
    const clearBefore = now - (duration * 1000);

    // Check if client is blocked
    const blockedKey = `blocked:${key}`;
    const isBlocked = await this.redis.get(blockedKey);
    
    if (isBlocked) {
      const blockedUntil = new Date(parseInt(isBlocked));
      throw new PlatformError(
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded. Blocked until ${blockedUntil.toISOString()}`,
        { blockedUntil }
      );
    }

    // Remove old requests
    await this.redis.zremrangebyscore(key, 0, clearBefore);

    // Count recent requests
    const recentRequests = await this.redis.zcard(key);

    // If limit exceeded, block the client
    if (recentRequests >= points) {
      if (blockDuration) {
        const blockUntil = now + (blockDuration * 1000);
        await this.redis.set(blockedKey, blockUntil, 'EX', blockDuration);

        this.logger.warn({
          message: 'Client blocked due to rate limit',
          category: 'security',
          metadata: { key, blockUntil: new Date(blockUntil) }
        });

        throw new PlatformError(
          'RATE_LIMIT_EXCEEDED',
          `Rate limit exceeded. Blocked until ${new Date(blockUntil).toISOString()}`,
          { blockedUntil: new Date(blockUntil) }
        );
      }

      throw new PlatformError(
        'RATE_LIMIT_EXCEEDED',
        'Rate limit exceeded'
      );
    }

    // Record this request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiry on the set
    await this.redis.expire(key, duration);

    // Calculate reset time
    const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetTime = new Date(parseInt(oldestRequest[1]) + (duration * 1000));

    return {
      remaining: points - recentRequests - 1,
      resetTime,
      blocked: false
    };
  }

  /**
   * Get current rate limit status
   */
  async getStatus(key: string, config: RateLimitConfig = this.defaultConfig): Promise<RateLimitInfo> {
    const { points, duration } = config;
    const now = Date.now();
    const clearBefore = now - (duration * 1000);

    // Check if blocked
    const blockedKey = `blocked:${key}`;
    const blockedUntil = await this.redis.get(blockedKey);
    
    if (blockedUntil) {
      return {
        remaining: 0,
        resetTime: new Date(parseInt(blockedUntil)),
        blocked: true
      };
    }

    // Remove old requests
    await this.redis.zremrangebyscore(key, 0, clearBefore);

    // Count recent requests
    const recentRequests = await this.redis.zcard(key);

    // Get reset time
    const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetTime = oldestRequest.length ? 
      new Date(parseInt(oldestRequest[1]) + (duration * 1000)) :
      new Date(now + (duration * 1000));

    return {
      remaining: Math.max(0, points - recentRequests),
      resetTime,
      blocked: false
    };
  }

  /**
   * Clear rate limit for a key
   */
  async clear(key: string): Promise<void> {
    await Promise.all([
      this.redis.del(key),
      this.redis.del(`blocked:${key}`)
    ]);
  }

  /**
   * Generate rate limit key from request data
   */
  static generateKey(params: {
    ip: string;
    path: string;
    userId?: string;
    method?: string;
  }): string {
    const { ip, path, userId, method } = params;
    const parts = ['ratelimit'];

    if (userId) {
      parts.push(`user:${userId}`);
    } else {
      parts.push(`ip:${ip}`);
    }

    if (method) {
      parts.push(method.toLowerCase());
    }

    parts.push(path.replace(/[^a-zA-Z0-9]/g, '_'));

    return parts.join(':');
  }
}