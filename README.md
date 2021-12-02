# VIES checker
Checks VAT number in VIES (https://ec.europa.eu/taxation_customs/vies)

### Usage
Require the module and

```js
const validVAT = VIES.isValid(COUNTRY_CODE, VAT_NUMBER);
console.log(`VAT number ${(validVAT : 'is' : 'is not')} in VIES`);
```
