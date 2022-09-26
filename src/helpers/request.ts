import https from 'https';
import { Response } from '../interfaces.js';

async function get(url: string): Promise<Response> {
	return new Promise(((resolve, reject) => {
		var options = {
			method: 'GET'
		};

		const request = https.request(url, options, (response) => {
			
			response.setEncoding('utf8');
			let returnData = '';

			response.on('data', (chunk) => {
				returnData += chunk;
			});

			response.on('end', () => {
				resolve(JSON.parse(returnData));
			});

			response.on('error', (error) => {
				reject(error);
			});
		});
		
		request.end();
	}));
}

export default async function request(country: string, number: string): Promise<Response | null> {
	const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${number}`;

	let response: Response;

	try {
		response = await get(url);
	} catch (e) {
		return null;
	}

	return response;
}
