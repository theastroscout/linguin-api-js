/*

Official JavaScript client for the Linguin API (https://api.linguin.xyz).

A thin wrapper: one method per endpoint, JSON in and out, no dependencies.
Full reference: https://linguin.xyz/@api/docs

	import Linguin from 'linguin-api';

	const linguin = new Linguin('YOUR_API_KEY');
	const entry = await linguin.lookup({ text: 'bonjour', lang: 'fr' });
	console.log(entry.items[0].definition);

*/

const VERSION     = '0.1.0';
const API_URL     = 'https://api.linguin.xyz';
const API_VERSION = '2026-06-01';

/*

An API error. `code` is the stable machine code from the docs
(unauthorized, invalid_params, rate_limited, ...), `status` the HTTP status.

*/

export class LinguinError extends Error {

	constructor(status, code, message) {
		super(message);
		this.name   = 'LinguinError';
		this.status = status;
		this.code   = code;
	}

}

/*

Client for the Linguin API. Every method is one POST and resolves to the
response object, or throws LinguinError on a non-2xx answer.

*/

export class Linguin {

	constructor(apiKey, { baseUrl = API_URL, apiVersion = API_VERSION } = {}) {
		this.apiKey     = apiKey;
		this.baseUrl    = baseUrl.replace(/\/+$/, '');
		this.apiVersion = apiVersion;
	}

	async call(method, body = {}) {
		const res = await fetch(`${this.baseUrl}/${method}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${this.apiKey}`,
				'API-Version': this.apiVersion,
				'Content-Type': 'application/json',
				'User-Agent': `linguin-api-js/${VERSION}`
			},
			body: JSON.stringify(body)
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new LinguinError(res.status, data.error || 'http_error',
				data.message || `HTTP ${res.status}`);
		}
		return data;
	}

	/*

	Dictionary entry for a term. mode 'fast' (default) returns the definition,
	'deep' the complete entry. Omit lang to autodetect.
	{ text, lang, locale, mode, limit, webhook }

	*/

	lookup(params) {
		return this.call('lookup', params);
	}

	/*

	Reverse dictionary: a meaning or description in, the words that fit out.
	mode 'terms' (default), 'fast' or 'deep'.
	{ query, lang, locale, mode, limit, webhook }

	*/

	reverse(params) {
		return this.call('reverse', params);
	}

	/*

	Translate text. mode 'fast' (default) or 'deep'. live cross-checks wording
	against current web usage, humanizer rewrites the output to read human,
	fallback lets a busy tier hand off to the other.
	{ text, from, to, mode, live, humanizer, fallback, webhook }

	*/

	translate(params) {
		return this.call('translate', params);
	}

	/*

	Bulk UI localization: a string array in, the array translated into one
	target language out, aligned one to one. Up to 1000 strings per call.
	{ strings, from, to, mode, fallback, webhook }

	*/

	localize(params) {
		return this.call('localize', params);
	}

	/*

	Fetch a stored result by its req_id, free. Returns the same body the
	original call produced, or { status: 'pending' } while it runs.

	*/

	get(reqId) {
		return this.call('get', { req_id: reqId });
	}

	/*

	Your usage per method and mode with a total, free. Dates are ISO 8601,
	since inclusive, until exclusive.
	{ since, until }

	*/

	report(params = {}) {
		return this.call('report', params);
	}

	/*

	Current prepaid balance in USD, free.

	*/

	balance() {
		return this.call('balance');
	}

	/*

	Open a Stripe payment link for a wallet top-up in USD, free to call.

	*/

	topup(amount) {
		return this.call('topup', { amount });
	}

	/*

	Send the unused paid balance back to the cards that paid it, free.

	*/

	refund() {
		return this.call('refund');
	}

	/*

	Mint an additional bearer key for your account, in the environment of the
	key you call with. The plaintext is in the response and nowhere else.

	*/

	key() {
		return this.call('key');
	}

	/*

	Deactivate one of your keys, named by full value or prefix. The last
	active key is refused: mint a replacement first.
	{ key, prefix }

	*/

	revoke(params) {
		return this.call('revoke', params);
	}

}

export default Linguin;
