import type { HashString } from "./hash.ts";

export interface DocumentConfig {
	readonly url: string;
	readonly path: string;
	readonly rawPath: string;
	readonly hash: HashString;
}

export const BOTS_API_DOCUMENT = {
	url: "https://core.telegram.org/bots/api",
	path: "sources/telegram/bots-api.html",
	rawPath: "sources/telegram/bots-api.raw.html",
	hash: "sha256-c26e4bca67c640bd544caa3be126c2c9f10cd304cc0eac6c29a6bfe9de4ed6ac",
} as const satisfies DocumentConfig;
