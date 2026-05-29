import { Data, Effect, FileSystem, Path } from "effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import type { DocumentConfig } from "./document.ts";
import { verifyHash } from "./hash.ts";
import { normalizeDocument } from "./normalize-document.ts";

export class DocumentFetchError extends Data.TaggedError("DocumentFetchError")<{
	readonly url: string;
	readonly cause: unknown;
}> {}

export interface FetchedDocument {
	readonly path: string;
	readonly hash: DocumentConfig["hash"];
	readonly bytes: number;
}

export const fetchDocument = Effect.fn("fetchDocument")(function* (config: DocumentConfig) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const httpClient = yield* HttpClient.HttpClient;

	const responseBytes = yield* httpClient.get(config.url).pipe(
		Effect.flatMap(response => response.arrayBuffer),
		Effect.map(buffer => new Uint8Array(buffer)),
		Effect.mapError(cause => new DocumentFetchError({ url: config.url, cause })),
	);

	const bytes = normalizeDocument(responseBytes);

	yield* verifyHash(bytes, config.hash, config.path);

	const directory = path.dirname(config.path);
	if (directory !== ".") {
		yield* fs.makeDirectory(directory, { recursive: true });
	}

	yield* fs.writeFile(config.path, bytes);

	return {
		path: config.path,
		hash: config.hash,
		bytes: bytes.length,
	} satisfies FetchedDocument;
});
