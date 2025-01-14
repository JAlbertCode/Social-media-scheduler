/**
 * Custom error types for platform-specific errors
 */

export type ErrorCode = 
  | 'API_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'PLATFORM_ERROR';

export class PlatformError extends Error {
  code: ErrorCode;
  context?: Record<string, any>;

  constructor(code: ErrorCode, message: string, context?: Record<string, any>) {
    super(message);
    this.name = 'PlatformError';
    this.code = code;
    this.context = context;
  }

  /**
   * Convert error to a JSON-serializable object
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context
    };
  }
}