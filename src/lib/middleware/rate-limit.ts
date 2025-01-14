import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '../services/rate-limiter';
import { Logger } from '../services/logger';

const logger = Logger.getInstance();
const rateLimiter = new RateLimiter(process.env.REDIS_URL || '');

// Rate limit configurations for different endpoints
const rateLimitConfigs: Record<string, {
  points: number;
  duration: number;
  blockDuration?: number;
}> = {
  default: {
    points: 60,    // 60 requests
    duration: 60,  // per minute
    blockDuration: 300 // 5 minute block
  },
  auth: {
    points: 5,     // 5 requests
    duration: 60,  // per minute
    blockDuration: 900 // 15 minute block
  },
  media: {
    points: 30,    // 30 requests
    duration: 60,  // per minute
    blockDuration: 300 // 5 minute block
  },
  social: {
    points: 100,   // 100 requests
    duration: 300, // per 5 minutes
    blockDuration: 600 // 10 minute block
  }
};

export function withRateLimit(handler: Function, configKey: string = 'default') {
  return async function(req: NextRequest, ...args: any[]) {
    try {
      // Get rate limit key components
      const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
      const userId = req.headers.get('x-user-id');
      const path = req.nextUrl.pathname;
      const method = req.method;

      // Generate rate limit key
      const key = RateLimiter.generateKey({ ip, path, userId, method });

      // Get appropriate config
      const config = rateLimitConfigs[configKey] || rateLimitConfigs.default;

      // Check rate limit
      const rateLimitInfo = await rateLimiter.consume(key, config);

      // Add rate limit headers to response
      const response = await handler(req, ...args);
      
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Limit', config.points.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
        response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.getTime().toString());
      }

      return response;
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        logger.warn({
          message: 'Rate limit exceeded',
          category: 'security',
          metadata: {
            path: req.nextUrl.pathname,
            method: req.method,
            ip: req.ip
          }
        });

        return NextResponse.json(
          { error: error.message },
          {
            status: 429,
            headers: {
              'Retry-After': error.context?.blockedUntil ? 
                Math.ceil((new Date(error.context.blockedUntil).getTime() - Date.now()) / 1000).toString() :
                '60'
            }
          }
        );
      }

      throw error;
    }
  };
}

// Helper to apply rate limiting to a group of routes
export function applyRateLimit(routeHandler: any, configKey: string = 'default') {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const handler = routeHandler;

  methods.forEach(method => {
    if (method.toLowerCase() in handler) {
      const originalMethod = handler[method.toLowerCase()];
      handler[method.toLowerCase()] = withRateLimit(originalMethod, configKey);
    }
  });

  return handler;
}