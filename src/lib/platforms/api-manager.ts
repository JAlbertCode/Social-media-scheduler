import { RateLimiter } from '@/lib/utils/rate-limiter';
import { retry } from '@/lib/utils/retry';
import { PlatformError } from '@/lib/utils/errors';

type Platform = 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN' | 'YOUTUBE' | 'TIKTOK' | 'THREADS';

interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<Platform, RateLimitConfig> = {
  TWITTER: { requests: 300, windowMs: 900000 }, // 300 requests per 15 minutes
  INSTAGRAM: { requests: 200, windowMs: 3600000 }, // 200 requests per hour
  LINKEDIN: { requests: 100, windowMs: 86400000 }, // 100 requests per day
  YOUTUBE: { requests: 1000, windowMs: 86400000 }, // 1000 requests per day
  TIKTOK: { requests: 300, windowMs: 3600000 }, // 300 requests per hour
  THREADS: { requests: 200, windowMs: 3600000 }, // 200 requests per hour
};

/**
 * Manages API interactions across multiple social media platforms
 */
export class APIManager {
  private rateLimiters: Map<Platform, RateLimiter>;
  private retryConfig = {
    maxAttempts: 3,
    backoffMs: 1000,
  };

  constructor() {
    // Initialize rate limiters for each platform
    this.rateLimiters = new Map(
      Object.entries(RATE_LIMITS).map(([platform, config]) => [
        platform as Platform,
        new RateLimiter(config.requests, config.windowMs)
      ])
    );
  }

  /**
   * Execute an API request with rate limiting and retries
   */
  async execute<T>(
    platform: Platform,
    operation: () => Promise<T>,
    options: {
      skipRateLimit?: boolean;
      skipRetry?: boolean;
      context?: string;
    } = {}
  ): Promise<T> {
    const { skipRateLimit = false, skipRetry = false, context = 'API operation' } = options;

    try {
      // Check rate limit unless skipped
      if (!skipRateLimit) {
        const limiter = this.rateLimiters.get(platform);
        if (!limiter) {
          throw new Error(`Rate limiter not found for platform: ${platform}`);
        }

        if (!limiter.canMakeRequest()) {
          throw new PlatformError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', { platform });
        }
      }

      // Execute the operation with retry logic unless skipped
      const result = skipRetry
        ? await operation()
        : await retry(
            operation,
            this.retryConfig.maxAttempts,
            this.retryConfig.backoffMs
          );

      return result;
    } catch (error) {
      // Enhance error with platform context
      if (error instanceof PlatformError) {
        error.context = { ...error.context, platform };
        throw error;
      }

      throw new PlatformError(
        'API_ERROR',
        `Error during ${context}: ${error.message}`,
        { platform, originalError: error }
      );
    }
  }

  /**
   * Get current rate limit status for a platform
   */
  getRateLimitStatus(platform: Platform) {
    const limiter = this.rateLimiters.get(platform);
    if (!limiter) {
      throw new Error(`Rate limiter not found for platform: ${platform}`);
    }

    return limiter.getStatus();
  }

  /**
   * Reset rate limit for a platform
   */
  resetRateLimit(platform: Platform) {
    const limiter = this.rateLimiters.get(platform);
    if (!limiter) {
      throw new Error(`Rate limiter not found for platform: ${platform}`);
    }

    limiter.reset();
  }
}