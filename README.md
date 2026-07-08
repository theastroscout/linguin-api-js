# Linguin API for JavaScript

Official JavaScript client for the [Linguin API](https://linguin.xyz/@api): a multilingual dictionary and translation API. Look up any word or phrase in any language, run a reverse dictionary search, translate text and localize UI strings.

No dependencies, TypeScript types included, Node 18+.

- Full API reference: [linguin.xyz/@api/docs](https://linguin.xyz/@api/docs)
- Get an API key: [linguin.xyz/@api/access](https://linguin.xyz/@api/access)
- Python client: [linguin-api-py](https://github.com/theastroscout/linguin-api-py)

## Install

```
npm install linguin-api
```

## Quickstart

```js
import Linguin from 'linguin-api';

const linguin = new Linguin('YOUR_API_KEY');

const entry = await linguin.lookup({ text: 'bonjour', lang: 'fr' });
console.log(entry.items[0].definition);
// The standard French daytime greeting, equivalent to 'hello' or 'good day'.
```

Every method resolves to the API response object and throws `LinguinError` on failure. Keys belong on the server, never in client-side code.

## Dictionary

`lookup` returns the dictionary entry for a term. Mode `fast` (default) carries the definition, `deep` the complete entry with pronunciation, meanings, examples, synonyms, etymology and categories. Omit `lang` to autodetect the word's language.

```js
const entry = await linguin.lookup({ text: 'Serendipität', lang: 'de', locale: 'en', mode: 'deep' });
for (const meaning of entry.items[0].meanings) {
	console.log(meaning.name, '-', meaning.definition);
}
```

`reverse` is a reverse dictionary: describe a meaning and get the words that fit. Mode `terms` (default) returns bare words, `fast` adds definitions, `deep` the complete entries.

```js
const result = await linguin.reverse({ query: 'a doctor for animals', lang: 'en', mode: 'fast', limit: 2 });
for (const match of result.matches) {
	console.log(match.term, '-', match.definition);
}
// veterinarian - A doctor who treats animals.
// vet - An informal short form of veterinarian, a doctor who treats animals.
```

## Translate

Mode `fast` is a quick pass, `deep` weighs context, idiom, register and tone. `live: true` cross-checks the wording against current web usage, `humanizer: true` rewrites the output so it reads like a person wrote it.

```js
const result = await linguin.translate({ text: 'Hola, ¿cómo estás?', from: 'es', to: 'en' });
console.log(result.translation);
// Hello, how are you?
```

## Localize

Bulk UI localization: an array of strings in, the array translated into one target language out, same length, same order, so it maps straight back onto your keys. Up to 1000 strings per call.

```js
const result = await linguin.localize({ strings: ['Save', 'Cancel', 'Your changes were saved.'], to: 'de' });
console.log(result.strings);
// ['Speichern', 'Abbrechen', 'Deine Änderungen wurden gespeichert.']
```

## Async delivery

Every generating method takes an optional `webhook`. With one, the call returns at once with a `req_id` and the result is POSTed to your URL when ready. A missed callback is recoverable: `get(reqId)` returns any result by its id, free.

```js
const ticket = await linguin.translate({ text: longText, to: 'ja', mode: 'deep', webhook: 'https://example.com/hook' });
// { req_id: '9f1c7b3e-...', status: 'queued' }

const result = await linguin.get(ticket.req_id);
```

## Account

Billing is prepaid and per word or per call, with the exact charge attached to every response as `billed`. All account methods are free to call.

```js
await linguin.balance();                       // { balance: 24.9955 }
await linguin.report({ since: '2026-07-01' }); // calls and cost per method, plus a total
await linguin.topup(50);                       // Stripe payment link for a wallet top-up
await linguin.refund();                        // unused paid balance back to your cards

const fresh = await linguin.key();             // mint an additional key
await linguin.revoke({ prefix: fresh.prefix }); // revoke one by full value or prefix
```

## Errors

A non-2xx response throws `LinguinError` with a stable `code` you can switch on, the HTTP `status` and a human `message`. Codes are listed in the [API reference](https://linguin.xyz/@api/docs).

```js
import Linguin, { LinguinError } from 'linguin-api';

try {
	await linguin.lookup({ text: 'qwzrtplk' });
} catch (e) {
	if (e instanceof LinguinError && e.code === 'not_found') {
		console.log('no such word');
	} else {
		throw e;
	}
}
```

## License

MIT
