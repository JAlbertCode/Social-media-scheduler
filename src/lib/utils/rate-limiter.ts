/**
 * Implements a sliding window rate limiter
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a new request can be made
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove timestamps outside the window
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp <= this.windowMs
    );

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true;
    }

    return false;
  }

  /**
   * Get current rate limit status
   */
  getStatus() {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp <= this.windowMs
    );

    return {
      remaining: this.maxRequests - this.timestamps.length,
      total: this.maxRequests,
      resetsIn: this.timestamps.length > 0
        ? this.windowMs - (now - this.timestamps[0])
        : 0
    };
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.timestamps = [];
  }
}