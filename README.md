# VIES checker
![EU API Works](https://github.com/itaibo/vies-checker/actions/workflows/eu-api.yaml/badge.svg)

European VIES VAT number validator (https://ec.europa.eu/taxation_customs/vies)

### Installation
```sh
npm install vies-checker
```

### Usage

#### Require/Import the module
```js
const { isValid } = require('vies-checker');

import { isValid } from 'vies-checker';
```

#### Use the isValid function
```js
const COUNTRY_CODE = 'IT';
const VAT_NUMBER = 'B12345678';

// isValid returns a boolean. If something is wrong, it will throw an error
try {
  const validVAT = await isValid(COUNTRY_CODE, VAT_NUMBER);
  console.log(`VAT number ${(validVAT ? 'is' : 'is not')} in VIES`);
} catch (e) {
  console.error(e);
}

```

### Errors
These are the errors that might occur. Use a try/catch to handle them properly.

| Error name | Description |
|---|---|
| `GLOBAL_MAX_CONCURRENT_REQ` | Your Request for VAT validation has not been processed; the maximum number of concurrent requests has been reached |
| `MS_MAX_CONCURRENT_REQ` | Your Request for VAT validation has not been processed; the maximum number of concurrent requests for this Member State has been reached |
| `SERVICE_UNAVAILABLE` | An error was encountered either at the network level or the Web application level, try again later |
| `MS_UNAVAILABLE` | The application at the Member State is not replying or not available |
| `TIMEOUT` | The application did not receive a reply within the allocated time period, try again later |

> Thanks to [@pano9000](https://github.com/pano9000) for [pointing out](https://github.com/itaibo/vies-checker/issues/1) these errors 
