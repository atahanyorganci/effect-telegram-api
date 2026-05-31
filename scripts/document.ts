import type { HashString } from "./hash.ts";

export interface DocumentConfig {
	readonly url: string;
	readonly path: string;
	readonly rawPath: string;
	readonly specDir: string;
	readonly hash: HashString;
}

export const BOTS_API_DOCUMENT = {
	url: "https://core.telegram.org/bots/api",
	path: "spec/api.html",
	rawPath: "spec/api.raw.html",
	specDir: "spec",
	hash: "sha256-c26e4bca67c640bd544caa3be126c2c9f10cd304cc0eac6c29a6bfe9de4ed6ac",
} as const satisfies DocumentConfig;

export const docUrlFromSlug = (slug: string): string => `${BOTS_API_DOCUMENT.url}#${slug}`;

export const schemaSpecPath = (specDir: string, name: string): string => `${specDir}/schema/${name}.json`;

export const endpointSpecPath = (specDir: string, name: string): string => `${specDir}/endpoints/${name}.json`;

export const errorsSpecDir = (specDir: string): string => `${specDir}/errors`;

export const errorsCatalogPath = (specDir: string): string => `${errorsSpecDir(specDir)}/errors.json`;
