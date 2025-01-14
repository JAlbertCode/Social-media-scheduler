/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number,
  initialBackoffMs: number
): Promise<T> {
  let lastError: Error;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt === maxAttempts) {
        break;
      }

      // Calculate backoff with exponential increase
      const backoffMs = initialBackoffMs * Math.pow(2, attempt - 1);
      // Add some random jitter
      const jitter = Math.random() * 200;
      
      await new Promise(resolve => setTimeout(resolve, backoffMs + jitter));
    }
  }

  throw new Error(`Operation failed after ${maxAttempts} attempts. Last error: ${lastError.message}`);
}