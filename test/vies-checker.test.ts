import { isValid } from '../src';

test('Check valid VIES', async () => {
	const result = await isValid('LU', '19647148');
	expect(result).toBe(true);
});

test('Check valid country code + invalid number VIES', async () => {
	const result = await isValid('ES', 'ABC123456');
	expect(result).toBe(false);
});

test('Check invalid country code VIES', async () => {
	// @ts-ignore
	const result = await isValid('ZZ', 'ABC123456');
	expect(result).toBe(false);
});
