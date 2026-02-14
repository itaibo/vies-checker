# VIES Checker

![EU API Works](https://github.com/itaibo/vies-checker/actions/workflows/eu-api.yaml/badge.svg)

Modern European VIES VAT number validator with full TypeScript support.

## Features

- ✅ **Native fetch API** - Uses Node.js 18+ built-in fetch (no dependencies!)
- ✅ **Full TypeScript support** - Comprehensive types for all API responses
- ✅ **Rich company data** - Get company name, address, and validation details
- ✅ **Robust error handling** - Custom error class with helper methods
- ✅ **Timeout & retry support** - Configurable timeouts and automatic retries
- ✅ **Input normalization** - Automatically handles spaces, dashes, and case
- ✅ **ESM & CommonJS** - Dual module support for maximum compatibility
- ✅ **Zero dependencies** - Lightweight and secure

## Requirements

- **Node.js >= 18.0.0** (for native fetch API support)

## Installation

```bash
npm install vies-checker
# or
pnpm add vies-checker
# or
yarn add vies-checker
```

## Quick Start

### Basic Validation with Full Details

```typescript
import { checkVAT } from 'vies-checker';

const result = await checkVAT('LU', '26375245');

console.log(result.isValid);     // true
console.log(result.name);        // "AMAZON EUROPE CORE S.A R.L."
console.log(result.address);     // "38, AVENUE JOHN F. KENNEDY\nL-1855  LUXEMBOURG"
console.log(result.requestDate); // Date object
```

### Simple Boolean Check

```typescript
import { isValid } from 'vies-checker';

const valid = await isValid('LU', '26375245');
console.log(valid); // true
```

## API Reference

### `checkVAT(country, vatNumber, options?)`

Validates a VAT number and returns comprehensive company information.

**Parameters:**

- `country` (string) - Two-letter EU country code (e.g., 'LU', 'DE', 'FR', 'IT')
- `vatNumber` (string) - VAT number to validate (spaces/dashes will be removed automatically)
- `options` (object, optional)
  - `timeout` (number) - Request timeout in milliseconds (default: 10000)
  - `retries` (number) - Number of retry attempts on network errors (default: 0)

**Returns:** `Promise<ViesCheckResult>`

```typescript
interface ViesCheckResult {
  isValid: boolean;
  requestDate: Date;
  country: EuropeanMemberState;
  vatNumber: string;
  name?: string;              // Company name (if valid)
  address?: string;           // Company address (if valid)
  approximateMatch?: object;  // Approximate matching details
}
```

**Throws:** `ViesError` - When the VIES service returns an error state

**Examples:**

```typescript
// Basic usage
const result = await checkVAT('LU', '26375245');

// With timeout
const result = await checkVAT('LU', '26375245', { timeout: 5000 });

// With retries
const result = await checkVAT('LU', '26375245', { retries: 2 });

// Input is normalized automatically
const result = await checkVAT('lu', '26 37 52 45'); // Works fine!
```

---

### `isValid(country, vatNumber)`

**⚠️ Deprecated** - Consider using `checkVAT()` for richer response data.

Simple boolean validation check for backward compatibility.

**Parameters:**

- `country` (EuropeanMemberState) - Two-letter EU country code
- `vatNumber` (string) - VAT number to validate

**Returns:** `Promise<boolean | null>`

- `true` - VAT number is valid
- `false` - VAT number is invalid or network error occurred
- `null` - Missing country or VAT number

**Throws:** `ViesError` - On service errors (rate limits, unavailable, etc.)

**Example:**

```typescript
const valid = await isValid('LU', '26375245');
console.log(valid); // true
```

## Response Format

The `checkVAT()` function returns a comprehensive result object:

```typescript
{
  isValid: boolean;           // true if VAT is valid in VIES
  requestDate: Date;          // When the validation was performed
  country: string;            // Country code (e.g., 'LU')
  vatNumber: string;          // Validated VAT number
  name?: string;              // Company name (only if valid)
  address?: string;           // Full company address (only if valid)
  approximateMatch?: {        // Approximate matching details
    name: string;
    street: string;
    postalCode: string;
    city: string;
    companyType: string;
    matchName: 1 | 2 | 3;     // 1=valid, 2=invalid, 3=not processed
    matchStreet: 1 | 2 | 3;
    matchPostalCode: 1 | 2 | 3;
    matchCity: 1 | 2 | 3;
    matchCompanyType: 1 | 2 | 3;
  }
}
```

## Error Handling

The package uses a custom `ViesError` class for API-related errors:

```typescript
import { checkVAT, ViesError } from 'vies-checker';

try {
  const result = await checkVAT('LU', '26375245');
  console.log(result.name);
} catch (error) {
  if (error instanceof ViesError) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);

    // Check error type
    if (error.isTransient()) {
      console.log('Temporary error, retry might work');
    }

    if (error.isRateLimitError()) {
      console.log('Rate limit hit, slow down requests');
    }
  }
}
```

### Error Codes

| Error Code | Description | Transient? | Action |
|-----------|-------------|------------|--------|
| `VALID` | VAT number is valid | N/A | Success |
| `INVALID` | VAT number is invalid | N/A | Expected |
| `INVALID_INPUT` | Input validation failed | No | Fix input format |
| `GLOBAL_MAX_CONCURRENT_REQ` | Too many concurrent requests globally | Yes | Wait and retry |
| `MS_MAX_CONCURRENT_REQ` | Too many concurrent requests for member state | Yes | Wait and retry |
| `SERVICE_UNAVAILABLE` | VIES service is unavailable | Yes | Retry later |
| `MS_UNAVAILABLE` | Member state service unavailable | Yes | Retry later |
| `TIMEOUT` | Request timed out | Yes | Retry with longer timeout |

### ViesError Helper Methods

- `error.isTransient()` - Returns `true` if error is temporary and worth retrying
- `error.isRateLimitError()` - Returns `true` if error is due to rate limiting

## Advanced Usage

### Timeout Configuration

```typescript
// Set a custom timeout (in milliseconds)
const result = await checkVAT('LU', '26375245', {
  timeout: 5000  // 5 seconds
});
```

### Retry Logic

```typescript
// Automatically retry on network errors
const result = await checkVAT('LU', '26375245', {
  retries: 2  // Retry up to 2 times
});
```

### Combined Options

```typescript
const result = await checkVAT('LU', '26375245', {
  timeout: 15000,  // 15 second timeout
  retries: 3       // Retry 3 times on failure
});
```

### TypeScript Integration

Full TypeScript support with exported types:

```typescript
import {
  checkVAT,
  ViesCheckResult,
  ViesError,
  EuropeanMemberState
} from 'vies-checker';

async function validateCompany(
  country: EuropeanMemberState,
  vat: string
): Promise<ViesCheckResult> {
  return await checkVAT(country, vat);
}

// Type-safe error handling
try {
  const result = await validateCompany('LU', '26375245');
  console.log(result.name);
} catch (error) {
  if (error instanceof ViesError && error.isTransient()) {
    // Retry logic
  }
}
```

### Input Normalization

The package automatically normalizes inputs for convenience:

```typescript
// All of these work:
await checkVAT('LU', '26375245');
await checkVAT('lu', '26375245');      // Lowercase country
await checkVAT('LU', '26 37 52 45');   // Spaces
await checkVAT('LU', '26-37-52-45');   // Dashes
await checkVAT('LU', '26.37.52.45');   // Dots

// All normalize to: country='LU', vatNumber='26375245'
```

## Supported Countries

All 27 EU member states plus Northern Ireland:

`AT`, `BE`, `BG`, `CY`, `CZ`, `DE`, `DK`, `EE`, `EL` (Greece), `ES`, `FI`, `FR`, `HR`, `HU`, `IE`, `IT`, `LT`, `LU`, `LV`, `MT`, `NL`, `PL`, `PT`, `RO`, `SE`, `SI`, `SK`, `XI` (Northern Ireland)

## Migration from v3.x

### Breaking Changes

- **Node.js 18+ required** (v3.x worked on any Node.js version)
- **TypeScript 5.x recommended** (v3.x used TypeScript 4.x)

### Non-Breaking Changes

- The `isValid()` function works exactly the same way
- All imports remain compatible
- Return values are unchanged

### Recommended Migration

For new code, use `checkVAT()` to access rich company data:

```typescript
// v3.x
const valid = await isValid('LU', '26375245');

// v4.x - same as v3.x (still works!)
const valid = await isValid('LU', '26375245');

// v4.x - recommended (get more data!)
const result = await checkVAT('LU', '26375245');
console.log(result.isValid);  // same boolean
console.log(result.name);     // NEW: company name
console.log(result.address);  // NEW: company address
```

## Examples

### Validate and Display Company Info

```typescript
import { checkVAT } from 'vies-checker';

const result = await checkVAT('LU', '26375245');

if (result.isValid) {
  console.log(`✅ Valid VAT`);
  console.log(`Company: ${result.name}`);
  console.log(`Address: ${result.address}`);
} else {
  console.log(`❌ Invalid VAT`);
}
```

### Batch Validation with Error Handling

```typescript
import { checkVAT, ViesError } from 'vies-checker';

const companies = [
  { country: 'LU', vat: '26375245' },
  { country: 'DE', vat: '12345678' },
  { country: 'FR', vat: '98765432' },
];

for (const company of companies) {
  try {
    const result = await checkVAT(company.country, company.vat, {
      timeout: 10000,
      retries: 2
    });

    console.log(`${company.country}${company.vat}: ${result.isValid ? '✅' : '❌'}`);
    if (result.name) {
      console.log(`  → ${result.name}`);
    }
  } catch (error) {
    if (error instanceof ViesError) {
      console.log(`${company.country}${company.vat}: Error (${error.code})`);

      if (error.isTransient()) {
        console.log('  → Will retry later...');
      }
    }
  }
}
```

### Retry on Transient Errors

```typescript
import { checkVAT, ViesError } from 'vies-checker';

async function validateWithRetry(country: string, vat: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await checkVAT(country, vat, { timeout: 10000 });
    } catch (error) {
      if (error instanceof ViesError && error.isTransient() && attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        continue;
      }
      throw error;
    }
  }
}

const result = await validateWithRetry('LU', '26375245');
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Iñigo Taibo](https://github.com/itaibo)

## Links

- [GitHub Repository](https://github.com/itaibo/vies-checker)
- [npm Package](https://www.npmjs.com/package/vies-checker)
- [Official VIES Website](https://ec.europa.eu/taxation_customs/vies)
