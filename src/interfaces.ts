/**
 * All possible VIES user error codes
 */
export type ViesUserError =
  | 'VALID'
  | 'INVALID'
  | 'INVALID_INPUT'
  | 'GLOBAL_MAX_CONCURRENT_REQ'
  | 'MS_MAX_CONCURRENT_REQ'
  | 'SERVICE_UNAVAILABLE'
  | 'MS_UNAVAILABLE'
  | 'TIMEOUT';

/**
 * Match code values from VIES approximate matching
 * - 1: Valid match
 * - 2: Invalid match
 * - 3: Not processed
 */
export type ViesMatchCode = 1 | 2 | 3;

/**
 * Approximate match details from VIES
 */
export interface ViesApproximateMatch {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  companyType: string;
  matchName: ViesMatchCode;
  matchStreet: ViesMatchCode;
  matchPostalCode: ViesMatchCode;
  matchCity: ViesMatchCode;
  matchCompanyType: ViesMatchCode;
}

/**
 * Full VIES API response structure
 */
export interface ViesResponse {
  isValid: boolean;
  requestDate: string;
  userError: ViesUserError;
  name?: string;
  address?: string;
  requestIdentifier?: string;
  originalVatNumber?: string;
  vatNumber?: string;
  viesApproximate?: ViesApproximateMatch;
}

/**
 * Options for VIES VAT validation requests
 */
export interface ViesCheckOptions {
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Number of retry attempts on network errors (default: 0) */
  retries?: number;
}

/**
 * User-friendly validation result with parsed data
 */
export interface ViesCheckResult {
  isValid: boolean;
  requestDate: Date;
  country: EuropeanMemberState;
  vatNumber: string;
  name?: string;
  address?: string;
  approximateMatch?: ViesApproximateMatch;
}

/**
 * EU member state country codes
 */
export type EuropeanMemberState =
  | 'AT'
  | 'BE'
  | 'BG'
  | 'CY'
  | 'CZ'
  | 'DE'
  | 'DK'
  | 'EE'
  | 'EL'
  | 'ES'
  | 'EU'
  | 'FI'
  | 'FR'
  | 'HR'
  | 'IE'
  | 'IT'
  | 'LT'
  | 'LU'
  | 'LV'
  | 'MT'
  | 'NL'
  | 'PL'
  | 'PT'
  | 'RO'
  | 'SE'
  | 'SI'
  | 'SK'
  | 'XI';

/**
 * @deprecated Use ViesResponse instead
 */
export interface Response {
  isValid: boolean;
  userError: string;
}
