import { EuropeanMemberState } from './interfaces.js';
import { ViesError } from './errors.js';

/**
 * Valid EU member state codes
 */
const VALID_COUNTRIES: readonly EuropeanMemberState[] = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'EL',
  'ES',
  'EU',
  'FI',
  'FR',
  'HR',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
  'XI',
] as const;

/**
 * Validates country code format (2 uppercase letters)
 */
function isValidCountryCode(country: string): boolean {
  return /^[A-Z]{2}$/.test(country);
}

/**
 * Validates VAT number format (alphanumeric, 2-12 characters)
 */
function isValidVatNumber(vatNumber: string): boolean {
  return /^[A-Z0-9]{2,12}$/i.test(vatNumber);
}

/**
 * Validates and normalizes input parameters
 *
 * @param country - Country code (will be normalized to uppercase)
 * @param vatNumber - VAT number (will be normalized by removing spaces/separators)
 * @returns Normalized and validated inputs
 * @throws {ViesError} If inputs are invalid
 */
export function validateInput(
  country: string,
  vatNumber: string
): { country: EuropeanMemberState; vatNumber: string } {
  // Normalize inputs
  const normalizedCountry = country.trim().toUpperCase();
  const normalizedVatNumber = vatNumber.trim().replace(/[\s.-]/g, '');

  // Validate country code format
  if (!isValidCountryCode(normalizedCountry)) {
    throw new ViesError('INVALID_INPUT', `Invalid country code format: ${country}`);
  }

  // Check if valid EU member state
  if (!VALID_COUNTRIES.includes(normalizedCountry as EuropeanMemberState)) {
    throw new ViesError('INVALID_INPUT', `Unknown country code: ${normalizedCountry}`);
  }

  // Validate VAT number format
  if (!isValidVatNumber(normalizedVatNumber)) {
    throw new ViesError(
      'INVALID_INPUT',
      `Invalid VAT number format: ${vatNumber}. Must be alphanumeric, 2-12 characters.`
    );
  }

  return {
    country: normalizedCountry as EuropeanMemberState,
    vatNumber: normalizedVatNumber,
  };
}
