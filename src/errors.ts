import { ViesUserError } from './interfaces.js';

/**
 * Custom error class for VIES API errors
 *
 * @example
 * ```typescript
 * try {
 *   const result = await checkVAT('LU', '26375245');
 * } catch (error) {
 *   if (error instanceof ViesError) {
 *     console.log(error.code); // 'TIMEOUT', 'SERVICE_UNAVAILABLE', etc.
 *     if (error.isTransient()) {
 *       // Retry logic
 *     }
 *   }
 * }
 * ```
 */
export class ViesError extends Error {
  /**
   * The VIES error code
   */
  public readonly code: ViesUserError;

  constructor(code: ViesUserError, message?: string) {
    super(message || code);
    this.name = 'ViesError';
    this.code = code;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, ViesError.prototype);
  }

  /**
   * Check if error represents a rate limit
   * @returns true if the error is a rate limit error
   */
  public isRateLimitError(): boolean {
    return this.code === 'GLOBAL_MAX_CONCURRENT_REQ' || this.code === 'MS_MAX_CONCURRENT_REQ';
  }

  /**
   * Check if error might be transient and worth retrying
   * @returns true if the error is likely temporary
   */
  public isTransient(): boolean {
    return (
      this.code === 'SERVICE_UNAVAILABLE' ||
      this.code === 'MS_UNAVAILABLE' ||
      this.code === 'TIMEOUT'
    );
  }
}
