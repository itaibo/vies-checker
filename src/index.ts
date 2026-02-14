import fetchVies from './helpers/request.js';
import {
  ViesCheckResult,
  ViesCheckOptions,
  EuropeanMemberState,
  ViesResponse,
  ViesApproximateMatch,
  ViesUserError,
  ViesMatchCode,
} from './interfaces.js';
import { ViesError } from './errors.js';
import { validateInput } from './validators.js';

/**
 * Comprehensive VAT validation with full response data
 *
 * @param country - Two-letter EU country code (e.g., 'LU', 'DE', 'FR')
 * @param vatNumber - VAT number to validate (spaces and separators will be removed)
 * @param options - Optional request configuration (timeout, retries)
 * @returns Full validation result with company details
 * @throws {ViesError} When VIES service returns an error state
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await checkVAT('LU', '26375245');
 * console.log(result.name); // "AMAZON EUROPE CORE S.A R.L."
 * console.log(result.address); // Full address
 * console.log(result.isValid); // true
 *
 * // With timeout
 * const result = await checkVAT('LU', '26375245', { timeout: 5000 });
 *
 * // With retries
 * const result = await checkVAT('LU', '26375245', { retries: 2 });
 * ```
 */
export async function checkVAT(
  country: string | EuropeanMemberState,
  vatNumber: string,
  options?: ViesCheckOptions
): Promise<ViesCheckResult> {
  // Validate and normalize inputs
  const validated = validateInput(country, vatNumber);

  // Make API request
  const response = await fetchVies(validated.country, validated.vatNumber, options);

  // Transform to user-friendly result
  return {
    isValid: response.isValid,
    requestDate: new Date(response.requestDate),
    country: validated.country,
    vatNumber: response.vatNumber || validated.vatNumber,
    name: response.name,
    address: response.address,
    approximateMatch: response.viesApproximate,
  };
}

/**
 * Simple boolean VAT validation check
 *
 * @deprecated Consider using checkVAT() for richer response data including company name and address
 * @param country - Two-letter EU country code
 * @param number - VAT number to validate
 * @returns true if valid, false if invalid or on network errors
 * @throws {ViesError} When VIES service returns an error state (rate limits, service unavailable, etc.)
 *
 * @example
 * ```typescript
 * const valid = await isValid('LU', '26375245');
 * console.log(valid); // true
 * ```
 */
export async function isValid(
  country: EuropeanMemberState,
  number: string
): Promise<boolean | null> {
  if (!country || !number) return null;

  try {
    const result = await checkVAT(country, number);
    return result.isValid;
  } catch (error) {
    if (error instanceof ViesError) {
      throw error; // Propagate VIES errors
    }
    return false; // Network errors return false for backward compatibility
  }
}

// Export types
export type {
  ViesCheckResult,
  ViesCheckOptions,
  ViesResponse,
  ViesApproximateMatch,
  ViesUserError,
  ViesMatchCode,
  EuropeanMemberState,
};

// Export error class
export { ViesError };

// Default export for backward compatibility
export default isValid;
