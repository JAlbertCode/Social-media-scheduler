import { RateLimiter } from '@/lib/services/rate-limiter';
import Redis from 'ioredis-mock';
import { PlatformError } from '@/lib/utils/errors';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter('redis://localhost:6379');
  });

  afterEach(async () => {
    const redis = new Redis();
    await redis.flushall();
  });

  describe('consume', () => {
    it('should allow requests within limit', async () => {
      const key = 'test-key';
      const config = { points: 2, duration: 60 };

      const result1 = await rateLimiter.consume(key, config);
      expect(result1.remaining).toBe(1);
      expect(result1.blocked).toBe(false);

      const result2 = await rateLimiter.consume(key, config);
      expect(result2.remaining).toBe(0);
      expect(result2.blocked).toBe(false);
    });

    it('should block requests when limit exceeded', async () => {
      const key = 'test-key';
      const config = { points: 1, duration: 60, blockDuration: 300 };

      await rateLimiter.consume(key, config);

      await expect(rateLimiter.consume(key, config))
        .rejects
        .toThrow(PlatformError);
    });

    it('should reset after duration', async () => {
      const key = 'test-key';
      const config = { points: 1, duration: 1 }; // 1 second duration

      await rateLimiter.consume(key, config);

      // Wait for duration to pass
      await new Promise(resolve => setTimeout(resolve, 1100));

      const result = await rateLimiter.consume(key, config);
      expect(result.remaining).toBe(0);
      expect(result.blocked).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return correct status for unused key', async () => {
      const key = 'unused-key';
      const config = { points: 5, duration: 60 };

      const status = await rateLimiter.getStatus(key, config);
      expect(status.remaining).toBe(5);
      expect(status.blocked).toBe(false);
    });

    it('should return correct status for used key', async () => {
      const key = 'used-key';
      const config = { points: 5, duration: 60 };

      await rateLimiter.consume(key, config);
      const status = await rateLimiter.getStatus(key, config);
      
      expect(status.remaining).toBe(4);
      expect(status.blocked).toBe(false);
    });

    it('should return blocked status for blocked key', async () => {
      const key = 'blocked-key';
      const config = { points: 1, duration: 60, blockDuration: 300 };

      await rateLimiter.consume(key, config);
      await expect(rateLimiter.consume(key, config)).rejects.toThrow();

      const status = await rateLimiter.getStatus(key, config);
      expect(status.remaining).toBe(0);
      expect(status.blocked).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear rate limit data', async () => {
      const key = 'clear-test-key';
      const config = { points: 1, duration: 60 };

      await rateLimiter.consume(key, config);
      await rateLimiter.clear(key);

      const status = await rateLimiter.getStatus(key, config);
      expect(status.remaining).toBe(1);
      expect(status.blocked).toBe(false);
    });
  });

  describe('generateKey', () => {
    it('should generate key with user ID', () => {
      const key = RateLimiter.generateKey({
        ip: '127.0.0.1',
        path: '/api/test',
        userId: 'user123',
        method: 'GET'
      });

      expect(key).toBe('ratelimit:user:user123:get:api_test');
    });

    it('should generate key with IP when no user ID', () => {
      const key = RateLimiter.generateKey({
        ip: '127.0.0.1',
        path: '/api/test',
        method: 'POST'
      });

      expect(key).toBe('ratelimit:ip:127.0.0.1:post:api_test');
    });

    it('should sanitize path in key', () => {
      const key = RateLimiter.generateKey({
        ip: '127.0.0.1',
        path: '/api/test?query=value',
        method: 'GET'
      });

      expect(key).toBe('ratelimit:ip:127.0.0.1:get:api_test_query_value');
    });
  });
});