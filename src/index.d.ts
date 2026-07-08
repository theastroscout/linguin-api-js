/*

Type definitions for linguin-api.
Full reference: https://linguin.xyz/@api/docs

*/

export type LookupMode = 'fast' | 'deep';
export type ReverseMode = 'terms' | 'fast' | 'deep';

export interface ClientOptions {
	/* API host, defaults to https://api.linguin.xyz */
	baseUrl?: string;
	/* API-Version header, defaults to the version this client was built for */
	apiVersion?: string;
}

export interface Billed {
	cost: number;
	words?: number;
	passes?: number;
	matches?: number;
}

export interface Meaning {
	pos?: string;
	domain?: string;
	register?: string;
	name?: string;
	definition?: string;
	examples?: { phrase: string; translation: string }[];
	synonyms?: string[];
	antonyms?: string[];
	related_terms?: string[];
	translations?: string[];
}

export interface Item {
	type: string;
	term: string;
	lang: string;
	locale: string;
	definition: string;
	/* deep mode only */
	pron?: string;
	pos?: string[];
	forms?: string[];
	meanings?: Meaning[];
	etymology?: string;
	categories?: string[];
}

export interface LookupParams {
	/* word or phrase to look up */
	text: string;
	/* language of the word, or 'auto' (default) */
	lang?: string;
	/* localization to return the entry in, defaults to 'en' */
	locale?: string;
	/* 'fast' just the definition (default), 'deep' the complete entry */
	mode?: LookupMode;
	/* max entries to return, top first */
	limit?: number;
	/* optional async delivery URL */
	webhook?: string;
}

export interface LookupResponse {
	req_id: string;
	items: Item[];
	billed: Billed;
}

export interface ReverseParams {
	/* a meaning or description */
	query: string;
	/* language of the words, defaults to locale */
	lang?: string;
	/* localization to return definitions in, defaults to 'en' */
	locale?: string;
	/* 'terms' the word (default), 'fast' with a definition, 'deep' the whole entry */
	mode?: ReverseMode;
	/* max matches to return, top first */
	limit?: number;
	/* optional async delivery URL */
	webhook?: string;
}

export interface ReverseResponse {
	req_id: string;
	query: string;
	locale: string;
	matches: (Item | { term: string; lang: string })[];
	billed: Billed;
}

export interface TranslateParams {
	/* text to translate */
	text: string;
	/* source language, or 'auto' (default) */
	from?: string;
	/* language to translate into, defaults to 'en' */
	to?: string;
	/* 'fast' quick pass (default), 'deep' native-quality */
	mode?: LookupMode;
	/* cross-check the wording against live web usage */
	live?: boolean;
	/* rewrite the output to read human */
	humanizer?: boolean;
	/* a busy tier hands the request to the other one */
	fallback?: boolean;
	/* optional async delivery URL */
	webhook?: string;
}

export interface TranslateResponse {
	req_id: string;
	type: 'translation';
	mode: LookupMode;
	from: string;
	to: string;
	text: string;
	translation: string;
	words: number;
	live?: boolean;
	billed: Billed;
}

export interface LocalizeParams {
	/* strings to localize, up to 1000 per call */
	strings: string[];
	/* source language, or 'auto' (default) */
	from?: string;
	/* language to localize into, defaults to 'en' */
	to?: string;
	/* 'fast' quick pass (default), 'deep' native-quality */
	mode?: LookupMode;
	/* a busy tier hands the request to the other one */
	fallback?: boolean;
	/* optional async delivery URL */
	webhook?: string;
}

export interface LocalizeResponse {
	req_id: string;
	type: 'localization';
	mode: LookupMode;
	from: string;
	to: string;
	strings: string[];
	words: number;
	billed: Billed;
}

export interface QueuedResponse {
	req_id: string;
	status: 'queued';
}

export interface GetResponse {
	req_id: string;
	status?: 'pending';
	created_at?: string;
	delivered_at?: string;
	billed?: Billed;
	[key: string]: unknown;
}

export interface ReportParams {
	/* ISO 8601, inclusive */
	since?: string;
	/* ISO 8601, exclusive */
	until?: string;
}

export interface ReportResponse {
	methods: Record<string, { calls: number; cost: number }>;
	total: { calls: number; failed: number; cost: number };
}

export declare class LinguinError extends Error {
	status: number;
	code: string;
	constructor(status: number, code: string, message: string);
}

export declare class Linguin {
	apiKey: string;
	baseUrl: string;
	apiVersion: string;

	constructor(apiKey: string, options?: ClientOptions);

	call(method: string, body?: object): Promise<any>;

	lookup(params: LookupParams): Promise<LookupResponse | QueuedResponse>;
	reverse(params: ReverseParams): Promise<ReverseResponse | QueuedResponse>;
	translate(params: TranslateParams): Promise<TranslateResponse | QueuedResponse>;
	localize(params: LocalizeParams): Promise<LocalizeResponse | QueuedResponse>;
	get(reqId: string): Promise<GetResponse>;
	report(params?: ReportParams): Promise<ReportResponse>;
	balance(): Promise<{ balance: number }>;
	topup(amount: number): Promise<{ url: string; amount: number }>;
	refund(): Promise<{ refunded: number; balance: number }>;
	key(): Promise<{ key: string; prefix: string; env: string }>;
	revoke(params: { key?: string; prefix?: string }): Promise<{ revoked: string[] }>;
}

export default Linguin;
