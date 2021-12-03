# VIES checker
Checks VAT number in VIES (https://ec.europa.eu/taxation_customs/vies)

### Installation
```sh
npm install vies-checker
```

### Usage
```js
const vies = require('vies-checker');

const COUNTRY_CODE = 'IT';
const VAT_NUMBER = 'B12345678';

// vies.isValid returns a boolean
const validVAT = vies.isValid(COUNTRY_CODE, VAT_NUMBER);

console.log(`VAT number ${(validVAT : 'is' : 'is not')} in VIES`);
```
