import type { HashString } from "./hash.ts";

export interface DocumentConfig {
	readonly url: string;
	readonly path: string;
	readonly hash: HashString;
}

export const BOTS_API_DOCUMENT = {
	url: "https://core.telegram.org/bots/api",
	path: "sources/telegram/bots-api.html",
	hash: "sha256-bae6ddd09a5a6a1668a9beaf1564918994c5e33af1de407937fdcdafe2d42f25",
} as const satisfies DocumentConfig;
