import { Data, Effect, FileSystem, Path } from "effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { verifyHash } from "./hash.ts";
import { prepareRawDocument, sanitizeDocument } from "./normalize-document.ts";
import type { DocumentConfig } from "./document.ts";

export class DocumentFetchError extends Data.TaggedError("DocumentFetchError")<{
	readonly url: string;
	readonly cause: unknown;
}> {}

export interface FetchedDocument {
	readonly path: string;
	readonly rawPath: string;
	readonly hash: DocumentConfig["hash"];
	readonly bytes: number;
	readonly rawBytes: number;
}

const ensureParentDirectory = Effect.fn("ensureParentDirectory")(function* (filePath: string) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const directory = path.dirname(filePath);

	if (directory !== ".") {
		yield* fs.makeDirectory(directory, { recursive: true });
	}
});

export const fetchDocument = Effect.fn("fetchDocument")(function* (config: DocumentConfig) {
	const fs = yield* FileSystem.FileSystem;
	const httpClient = yield* HttpClient.HttpClient;

	const responseBytes = yield* httpClient.get(config.url).pipe(
		Effect.flatMap(response => response.arrayBuffer),
		Effect.map(buffer => new Uint8Array(buffer)),
		Effect.mapError(cause => new DocumentFetchError({ url: config.url, cause })),
	);

	const rawBytes = prepareRawDocument(responseBytes);
	const bytes = sanitizeDocument(rawBytes);

	yield* verifyHash(bytes, config.hash, config.path);

	yield* ensureParentDirectory(config.path);
	yield* ensureParentDirectory(config.rawPath);
	yield* fs.writeFile(config.rawPath, rawBytes);
	yield* fs.writeFile(config.path, bytes);

	return {
		path: config.path,
		rawPath: config.rawPath,
		hash: config.hash,
		bytes: bytes.length,
		rawBytes: rawBytes.length,
	} satisfies FetchedDocument;
});
