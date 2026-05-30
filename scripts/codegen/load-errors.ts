import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Schema from "effect/Schema";
import { parseError } from "../parse/errors.ts";
import { CommonErrorsDoc, MethodErrorsDoc } from "./model-errors.ts";

const decodeMethodErrors = Schema.decodeUnknownSync(MethodErrorsDoc);
const decodeCommonErrors = Schema.decodeUnknownSync(CommonErrorsDoc);

const ERRORS_DIR = "errors";

const mergeErrors = (method: MethodErrorsDoc, common: MethodErrorsDoc["errors"]): MethodErrorsDoc => {
	const methodTags = new Set(method.errors.map(error => error.tag));
	const merged = [...method.errors];
	for (const error of common) {
		if (!methodTags.has(error.tag)) {
			merged.push(error);
		}
	}
	return {
		method: method.method,
		errors: merged.sort((a, b) => a.tag.localeCompare(b.tag) || a.description.localeCompare(b.description)),
	};
};

export const loadMethodErrors = Effect.fn("loadMethodErrors")(function* () {
	const fs = yield* FileSystem.FileSystem;
	const entries = yield* fs.readDirectory(ERRORS_DIR);
	const files = entries.filter(entry => entry.endsWith(".json")).sort();

	const commonContents = yield* fs.readFileString(`${ERRORS_DIR}/common.json`);
	const common = decodeCommonErrors(JSON.parse(commonContents)).errors;

	const byMethod = new Map<string, MethodErrorsDoc>();
	for (const file of files) {
		if (file === "common.json") {
			continue;
		}

		const contents = yield* fs.readFileString(`${ERRORS_DIR}/${file}`);
		const doc = yield* Effect.try({
			try: () => decodeMethodErrors(JSON.parse(contents)),
			catch: cause => parseError(`Failed to decode ${ERRORS_DIR}/${file}: ${String(cause)}`),
		});

		if (byMethod.has(doc.method)) {
			return yield* Effect.fail(parseError(`Duplicate errors doc for method: ${doc.method}`));
		}
		byMethod.set(doc.method, mergeErrors(doc, common));
	}
	return byMethod;
});
