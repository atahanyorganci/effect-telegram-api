import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Schema from "effect/Schema";
import { parseError } from "../parse/errors.ts";
import { MethodErrorsDoc } from "./model-errors.ts";

const decodeMethodErrors = Schema.decodeUnknownSync(MethodErrorsDoc);

const ERRORS_DIR = "errors";

export const loadMethodErrors = Effect.fn("loadMethodErrors")(function* () {
	const fs = yield* FileSystem.FileSystem;
	const entries = yield* fs.readDirectory(ERRORS_DIR);
	const files = entries.filter(entry => entry.endsWith(".json")).sort();

	const docs: MethodErrorsDoc[] = [];
	for (const file of files) {
		const contents = yield* fs.readFileString(`${ERRORS_DIR}/${file}`);
		docs.push(
			yield* Effect.try({
				try: () => decodeMethodErrors(JSON.parse(contents)),
				catch: cause => parseError(`Failed to decode ${ERRORS_DIR}/${file}: ${String(cause)}`),
			}),
		);
	}

	const byMethod = new Map<string, MethodErrorsDoc>();
	for (const doc of docs) {
		if (byMethod.has(doc.method)) {
			return yield* Effect.fail(parseError(`Duplicate errors doc for method: ${doc.method}`));
		}
		byMethod.set(doc.method, doc);
	}
	return byMethod;
});
