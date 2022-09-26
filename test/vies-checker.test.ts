import { isValid } from '../src';

test('Check valid VIES', async () => {
	const result = await isValid('LU', '19647148');
	expect(result).toBe(true);
});

test('Check invalid VIES', async () => {
	const result = await isValid('ML', 'ABC123456');
	expect(result).toBe(false);
});
