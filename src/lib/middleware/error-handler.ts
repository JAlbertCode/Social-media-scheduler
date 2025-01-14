import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '../services/logger';
import { PlatformError } from '../utils/errors';

const logger = Logger.getInstance();

interface ErrorResponse {
  error: string;
  code?: string;
  context?: Record<string, any>;
}

export async function errorHandler(
  error: Error | PlatformError,
  req: NextRequest
): Promise<NextResponse<ErrorResponse>> {
  let statusCode = 500;
  let response: ErrorResponse = {
    error: 'Internal Server Error'
  };

  // Get user ID from request if available
  const userId = req.headers.get('x-user-id');

  if (error instanceof PlatformError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        statusCode = 400;
        break;
      case 'AUTH_ERROR':
        statusCode = 401;
        break;
      case 'RATE_LIMIT_EXCEEDED':
        statusCode = 429;
        break;
      case 'API_ERROR':
        statusCode = 502;
        break;
      default:
        statusCode = 500;
    }

    response = {
      error: error.message,
      code: error.code,
      context: error.context
    };

    // Log platform errors as warnings unless they're severe
    await logger.warn({
      message: error.message,
      category: 'api',
      metadata: {
        code: error.code,
        context: error.context,
        path: req.nextUrl.pathname,
        method: req.method
      },
      userId
    });
  } else {
    // Log unexpected errors as errors
    await logger.error({
      message: error.message,
      category: 'system',
      metadata: {
        path: req.nextUrl.pathname,
        method: req.method
      },
      userId,
      error
    });
  }

  return NextResponse.json(response, { status: statusCode });
}

export function withErrorHandler(handler: Function) {
  return async function(req: NextRequest, ...args: any[]) {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return errorHandler(error, req);
    }
  };
}