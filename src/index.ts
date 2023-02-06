import request from './helpers/request.js';
import { Response, EuropeanMemberState } from './interfaces.js';

export async function isValid(country: EuropeanMemberState, number:string): Promise<boolean | null> {
	if (!country || !number) return null;

	const response: null | Response = await request(country, number);
	if (!response) return false;

	const valid = (response.isValid);

	return valid;
}

export default isValid;
