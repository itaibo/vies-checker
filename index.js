const https = require('https');

const VALID_STRING_SEARCH = '<b><span class="validStyle">Yes, valid VAT number</span></b>';

// https://stackoverflow.com/questions/40537749/how-do-i-make-a-https-post-in-node-js-without-any-third-party-module
async function post(url, data) {
	let dataString = '';
	for (const [key, value] of Object.entries(data)) {
		dataString += `${key}=${value}&`;
	}

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': dataString.length,
		},
		timeout: 1000,
	};

	return new Promise((resolve, reject) => {
		const req = https.request(url, options, (res) => {
			if (res.statusCode < 200 || res.statusCode > 299) {
				return reject(new Error(`HTTP status code ${res.statusCode}`))
			}

			const body = []
			res.on('data', (chunk) => body.push(chunk))
			res.on('end', () => {
			const resString = Buffer.concat(body).toString()
			resolve(resString)
			});
	});

	req.on('error', (err) => {
		reject(err)
	});

	req.on('timeout', () => {
		req.destroy()
		reject(new Error('Request time out'))
	});

	req.write(dataString)
	req.end()
	});
}

async function request(country, number) {
	let response;

	try {
		response = await post('https://ec.europa.eu/taxation_customs/vies/vatResponse.html', {
			memberStateCode: country.trim().toUpperCase(),
			number: number.trim().toUpperCase(),
			check: 'Verify',
			action: 'check',
		});
	} catch (e) {
		return false;
	}

	return response;
}

async function isValid(country, number) {
	if (!country || !number) return false;

	const response = await request(country, number);
	if (!response) return false;

	const valid = (response.indexOf(VALID_STRING_SEARCH) !== -1);

	return valid;
}

exports.isValid = isValid;
