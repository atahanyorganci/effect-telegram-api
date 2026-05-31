import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Schema from "effect/Schema";
import { errorsCatalogPath, errorsSpecDir } from "../document.ts";
import { parseError } from "../parse/errors.ts";
import { HTTP_STATUS_ERRORS_BY_TAG } from "./http-status-errors.ts";
import { ErrorsDoc, MethodErrorsRefDoc } from "./model-errors.ts";
import type { MethodError, MethodErrorsDoc } from "./model-errors.ts";

const decodeErrorsDoc = Schema.decodeUnknownSync(ErrorsDoc);
const decodeMethodErrorsRef = Schema.decodeUnknownSync(MethodErrorsRefDoc);

const resolveTags = (method: string, tags: readonly string[]): MethodErrorsDoc["errors"] =>
	tags.map(tag => {
		const error = HTTP_STATUS_ERRORS_BY_TAG.get(tag);
		if (error === undefined) {
			throw parseError(`Unknown error tag ${JSON.stringify(tag)} referenced by method ${method}`);
		}
		return { tag: error.tag, errorCode: error.errorCode, when: error.when };
	});

const mergeCommon = (
	errors: MethodErrorsDoc["errors"],
	commonTags: readonly string[],
	catalogByTag: ReadonlyMap<string, MethodError>,
): MethodErrorsDoc["errors"] => {
	const methodTags = new Set(errors.map(error => error.tag));
	const merged = [...errors];
	for (const tag of commonTags) {
		if (!methodTags.has(tag)) {
			const error = catalogByTag.get(tag);
			if (error === undefined) {
				throw parseError(`Unknown common error tag ${JSON.stringify(tag)}`);
			}
			merged.push(error);
		}
	}
	return merged.sort((a, b) => a.tag.localeCompare(b.tag));
};

export const loadMethodErrors = Effect.fn("loadMethodErrors")(function* (specDir: string) {
	const fs = yield* FileSystem.FileSystem;
	const errorsDir = errorsSpecDir(specDir);
	const catalogPath = errorsCatalogPath(specDir);

	const catalogContents = yield* fs.readFileString(catalogPath);
	const catalog = decodeErrorsDoc(JSON.parse(catalogContents));
	const catalogByTag = new Map(catalog.errors.map(error => [error.tag, error] as const));

	const entries = yield* fs.readDirectory(errorsDir);
	const files = entries.filter(entry => entry.endsWith(".json") && entry !== "errors.json").sort();

	const byMethod = new Map<string, MethodErrorsDoc>();
	for (const file of files) {
		const path = `${errorsDir}/${file}`;
		const contents = yield* fs.readFileString(path);
		const doc = yield* Effect.try({
			try: () => decodeMethodErrorsRef(JSON.parse(contents)),
			catch: cause => parseError(`Failed to decode ${path}: ${String(cause)}`),
		});

		if (byMethod.has(doc.method)) {
			return yield* Effect.fail(parseError(`Duplicate errors doc for method: ${doc.method}`));
		}

		const errors = resolveTags(doc.method, doc.errors);
		byMethod.set(doc.method, {
			method: doc.method,
			errors: mergeCommon(errors, catalog.common, catalogByTag),
		});
	}
	return byMethod;
});
