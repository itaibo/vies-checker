import { EuropeanMemberState, ViesResponse, ViesCheckOptions } from '../interfaces.js';
import { ViesError } from '../errors.js';

// Type declarations for Node.js 18+ fetch API
declare const fetch: any;
declare const AbortController: any;
declare const setTimeout: any;
declare const clearTimeout: any;

/**
 * Delays execution for a specified number of milliseconds
 * @param ms - Milliseconds to delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if an error is a network error that might be retryable
 */
function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof Error &&
      (error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT')))
  );
}

/**
 * Validates the VIES response and throws appropriate errors
 * @param response - The VIES API response
 * @throws {ViesError} If the response contains an error state
 */
function validateResponse(response: ViesResponse): void {
  const errorStates = [
    'GLOBAL_MAX_CONCURRENT_REQ',
    'MS_MAX_CONCURRENT_REQ',
    'SERVICE_UNAVAILABLE',
    'MS_UNAVAILABLE',
    'TIMEOUT',
  ] as const;

  if (errorStates.includes(response.userError as any)) {
    throw new ViesError(response.userError);
  }
}

/**
 * Makes a request to the VIES API with timeout and retry support
 *
 * @param country - Two-letter EU country code
 * @param vatNumber - VAT number to validate
 * @param options - Request options (timeout, retries)
 * @returns VIES API response
 * @throws {ViesError} On API errors or validation failures
 *
 * @example
 * ```typescript
 * const response = await fetchVies('LU', '26375245', { timeout: 5000 });
 * ```
 */
export default async function fetchVies(
  country: EuropeanMemberState,
  vatNumber: string,
  options: ViesCheckOptions = {}
): Promise<ViesResponse> {
  const { timeout = 10000, retries = 0 } = options;
  const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vatNumber}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ViesError('SERVICE_UNAVAILABLE', `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ViesResponse = await response.json();
    validateResponse(data);

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ViesError('TIMEOUT', 'Request timed out');
    }

    // Propagate ViesError
    if (error instanceof ViesError) {
      throw error;
    }

    // Retry logic for network errors
    if (retries > 0 && isNetworkError(error)) {
      await delay(1000); // Simple backoff
      return fetchVies(country, vatNumber, { timeout, retries: retries - 1 });
    }

    // Wrap unknown errors
    throw new ViesError(
      'SERVICE_UNAVAILABLE',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}
