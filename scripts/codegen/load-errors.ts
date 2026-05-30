import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Schema from "effect/Schema";
import { parseError } from "../parse/errors.ts";
import { ErrorsDoc, expandError, MethodErrorsRefDoc } from "./model-errors.ts";
import type { MethodError, MethodErrorsDoc } from "./model-errors.ts";

const decodeErrorsDoc = Schema.decodeUnknownSync(ErrorsDoc);
const decodeMethodErrorsRef = Schema.decodeUnknownSync(MethodErrorsRefDoc);

const ERRORS_DIR = "errors";
const ERRORS_CATALOG = `${ERRORS_DIR}/errors.json`;

const resolveTags = (
	method: string,
	tags: readonly string[],
	byTag: ReadonlyMap<string, MethodError>,
): MethodErrorsDoc["errors"] =>
	tags.flatMap(tag => {
		const error = byTag.get(tag);
		if (error === undefined) {
			throw parseError(`Unknown error tag ${JSON.stringify(tag)} referenced by method ${method}`);
		}
		return expandError(error);
	});

const mergeCommon = (
	errors: MethodErrorsDoc["errors"],
	commonTags: readonly string[],
	byTag: ReadonlyMap<string, MethodError>,
): MethodErrorsDoc["errors"] => {
	const methodTags = new Set(errors.map(error => error.tag));
	const merged = [...errors];
	for (const tag of commonTags) {
		if (!methodTags.has(tag)) {
			const error = byTag.get(tag);
			if (error === undefined) {
				throw parseError(`Unknown common error tag ${JSON.stringify(tag)}`);
			}
			merged.push(...expandError(error));
		}
	}
	return merged.sort((a, b) => a.tag.localeCompare(b.tag) || a.description.localeCompare(b.description));
};

export const loadMethodErrors = Effect.fn("loadMethodErrors")(function* () {
	const fs = yield* FileSystem.FileSystem;

	const catalogContents = yield* fs.readFileString(ERRORS_CATALOG);
	const catalog = decodeErrorsDoc(JSON.parse(catalogContents));
	const byTag = new Map(catalog.errors.map(error => [error.tag, error] as const));

	const entries = yield* fs.readDirectory(ERRORS_DIR);
	const files = entries.filter(entry => entry.endsWith(".json") && entry !== "errors.json").sort();

	const byMethod = new Map<string, MethodErrorsDoc>();
	for (const file of files) {
		const contents = yield* fs.readFileString(`${ERRORS_DIR}/${file}`);
		const doc = yield* Effect.try({
			try: () => decodeMethodErrorsRef(JSON.parse(contents)),
			catch: cause => parseError(`Failed to decode ${ERRORS_DIR}/${file}: ${String(cause)}`),
		});

		if (byMethod.has(doc.method)) {
			return yield* Effect.fail(parseError(`Duplicate errors doc for method: ${doc.method}`));
		}

		const errors = resolveTags(doc.method, doc.errors, byTag);
		byMethod.set(doc.method, {
			method: doc.method,
			errors: mergeCommon(errors, catalog.common, byTag),
		});
	}
	return byMethod;
});
