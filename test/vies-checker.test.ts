import { isValid, checkVAT, ViesError } from '../src';

describe('Legacy API - isValid()', () => {
  test('returns true for valid VAT number', async () => {
    const result = await isValid('LU', '26375245');
    expect(result).toBe(true);
  });

  test('returns false for invalid VAT number', async () => {
    const result = await isValid('ES', 'ABC123456');
    expect(result).toBe(false);
  });

  test('throws error for invalid country code', async () => {
    // @ts-ignore - testing runtime behavior
    await expect(isValid('ZZ', 'ABC123456')).rejects.toThrow(ViesError);
  });

  test('returns null for empty country', async () => {
    // @ts-ignore - testing runtime behavior
    const result = await isValid('', '123456');
    expect(result).toBeNull();
  });

  test('returns null for empty VAT number', async () => {
    // @ts-ignore - testing runtime behavior
    const result = await isValid('LU', '');
    expect(result).toBeNull();
  });
});

describe('New API - checkVAT()', () => {
  test('returns full details for valid VAT', async () => {
    const result = await checkVAT('LU', '26375245');

    expect(result.isValid).toBe(true);
    expect(result.country).toBe('LU');
    expect(result.vatNumber).toBe('26375245');
    expect(result.name).toBeTruthy();
    expect(result.name).toContain('AMAZON');
    expect(result.address).toBeTruthy();
    expect(result.requestDate).toBeInstanceOf(Date);
  });

  test('requestDate is a valid Date object', async () => {
    const result = await checkVAT('LU', '26375245');

    expect(result.requestDate).toBeInstanceOf(Date);
    expect(result.requestDate.getTime()).toBeGreaterThan(0);
  });

  test('normalizes input (spaces, case)', async () => {
    const result = await checkVAT('lu', '263 752 45');

    expect(result.isValid).toBe(true);
    expect(result.country).toBe('LU');
    expect(result.vatNumber).toBe('26375245');
  });

  test('normalizes input (dashes)', async () => {
    const result = await checkVAT('LU', '263-752-45');

    expect(result.isValid).toBe(true);
    expect(result.vatNumber).toBe('26375245');
  });

  test('throws ViesError for invalid country code format', async () => {
    await expect(checkVAT('ZZZ', '123456')).rejects.toThrow(ViesError);
    await expect(checkVAT('ZZZ', '123456')).rejects.toThrow('Invalid country code format');
  });

  test('throws ViesError for unknown country code', async () => {
    await expect(checkVAT('ZZ', '123456')).rejects.toThrow(ViesError);
    await expect(checkVAT('ZZ', '123456')).rejects.toThrow('Unknown country code');
  });

  test('throws ViesError for empty VAT number', async () => {
    await expect(checkVAT('LU', '')).rejects.toThrow(ViesError);
    await expect(checkVAT('LU', '')).rejects.toThrow('Invalid VAT number format');
  });

  test('throws ViesError for invalid VAT format', async () => {
    await expect(checkVAT('LU', 'invalid@#$')).rejects.toThrow(ViesError);
    await expect(checkVAT('LU', 'X')).rejects.toThrow(ViesError); // Too short
  });

  test('returns isValid: false for invalid VAT number', async () => {
    const result = await checkVAT('LU', '99999999999');

    expect(result.isValid).toBe(false);
  });

  test('accepts timeout option', async () => {
    const result = await checkVAT('LU', '26375245', { timeout: 15000 });

    expect(result.isValid).toBe(true);
  });
});

describe('Error Handling - ViesError', () => {
  test('ViesError has correct properties', () => {
    const error = new ViesError('TIMEOUT', 'Custom message');

    expect(error.name).toBe('ViesError');
    expect(error.code).toBe('TIMEOUT');
    expect(error.message).toBe('Custom message');
  });

  test('ViesError defaults to code as message', () => {
    const error = new ViesError('SERVICE_UNAVAILABLE');

    expect(error.message).toBe('SERVICE_UNAVAILABLE');
  });

  test('ViesError instanceof Error', () => {
    const error = new ViesError('TIMEOUT');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ViesError);
  });

  test('ViesError.isRateLimitError() works', () => {
    const rateLimitError1 = new ViesError('GLOBAL_MAX_CONCURRENT_REQ');
    const rateLimitError2 = new ViesError('MS_MAX_CONCURRENT_REQ');
    const otherError = new ViesError('TIMEOUT');

    expect(rateLimitError1.isRateLimitError()).toBe(true);
    expect(rateLimitError2.isRateLimitError()).toBe(true);
    expect(otherError.isRateLimitError()).toBe(false);
  });

  test('ViesError.isTransient() works', () => {
    const transientError1 = new ViesError('SERVICE_UNAVAILABLE');
    const transientError2 = new ViesError('MS_UNAVAILABLE');
    const transientError3 = new ViesError('TIMEOUT');
    const permanentError = new ViesError('INVALID');

    expect(transientError1.isTransient()).toBe(true);
    expect(transientError2.isTransient()).toBe(true);
    expect(transientError3.isTransient()).toBe(true);
    expect(permanentError.isTransient()).toBe(false);
  });
});

describe('Input Validation', () => {
  test('country code normalization to uppercase', async () => {
    const result = await checkVAT('lu', '26375245');
    expect(result.country).toBe('LU');
  });

  test('VAT number normalization removes spaces', async () => {
    const result = await checkVAT('LU', '26 37 52 45');
    expect(result.vatNumber).toBe('26375245');
  });

  test('VAT number normalization removes dashes', async () => {
    const result = await checkVAT('LU', '26-37-52-45');
    expect(result.vatNumber).toBe('26375245');
  });

  test('VAT number normalization removes dots', async () => {
    const result = await checkVAT('LU', '26.37.52.45');
    expect(result.vatNumber).toBe('26375245');
  });

  test('rejects invalid country code format', async () => {
    await expect(checkVAT('L', '123456')).rejects.toThrow('Invalid country code format');
    await expect(checkVAT('LUX', '123456')).rejects.toThrow('Invalid country code format');
    await expect(checkVAT('123', '123456')).rejects.toThrow('Invalid country code format');
  });
});

describe('Integration Tests (Real API)', () => {
  test.skip('validates Amazon Europe Core S.A R.L. (LU)', async () => {
    const result = await checkVAT('LU', '26375245');

    expect(result.isValid).toBe(true);
    expect(result.name).toContain('AMAZON');
    expect(result.address).toBeTruthy();
  });

  test.skip('validates existing test case (LU)', async () => {
    const result = await checkVAT('LU', '19647148');

    expect(result.isValid).toBe(true);
    expect(result.name).toBeTruthy();
  });

  test.skip('returns isValid: false for clearly invalid number', async () => {
    const result = await checkVAT('LU', '00000000000');

    expect(result.isValid).toBe(false);
  });
});
