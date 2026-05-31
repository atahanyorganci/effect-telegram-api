import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { HTTP_STATUS_ERRORS, HTTP_STATUS_ERRORS_BY_CODE } from "./codegen/http-status-errors.ts";
import { BOTS_API_DOCUMENT } from "./document.ts";
import { errorsCatalogPath, errorsSpecDir } from "./document.ts";

type LegacyMethodError = {
	readonly tag: string;
	readonly errorCode: number;
	readonly description: string;
	readonly variants?: ReadonlyArray<{ readonly description: string }>;
};

type LegacyErrorsDoc = {
	readonly common: ReadonlyArray<string>;
	readonly errors: ReadonlyArray<LegacyMethodError>;
};

type MethodErrorsRefDoc = {
	readonly method: string;
	readonly errors: ReadonlyArray<string>;
};

const statusTagForLegacyTag = (tag: string, byTag: ReadonlyMap<string, LegacyMethodError>): string => {
	const error = byTag.get(tag);
	if (error === undefined) {
		throw new Error(`Unknown legacy error tag: ${tag}`);
	}
	const status = HTTP_STATUS_ERRORS_BY_CODE.get(error.errorCode);
	if (status === undefined) {
		throw new Error(`No HTTP status error for legacy errorCode ${error.errorCode} (tag ${tag})`);
	}
	return status.tag;
};

const program = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const errorsDir = errorsSpecDir(BOTS_API_DOCUMENT.specDir);
	const catalogPath = errorsCatalogPath(BOTS_API_DOCUMENT.specDir);

	const catalogContents = yield* fs.readFileString(catalogPath);
	const legacyCatalog = JSON.parse(catalogContents) as LegacyErrorsDoc;
	const byTag = new Map(legacyCatalog.errors.map(error => [error.tag, error] as const));

	const entries = yield* fs.readDirectory(errorsDir);
	const files = entries.filter(entry => entry.endsWith(".json") && entry !== "errors.json").sort();

	for (const file of files) {
		const path = `${errorsDir}/${file}`;
		const doc = JSON.parse(yield* fs.readFileString(path)) as MethodErrorsRefDoc;
		const statusTags = [...new Set(doc.errors.map(tag => statusTagForLegacyTag(tag, byTag)))].sort((a, b) =>
			a.localeCompare(b),
		);
		yield* fs.writeFileString(path, `${JSON.stringify({ method: doc.method, errors: statusTags }, null, "\t")}\n`);
	}

	const newCatalog = {
		common: legacyCatalog.common,
		errors: HTTP_STATUS_ERRORS.map(error => ({
			tag: error.tag,
			errorCode: error.errorCode,
			...(error.when === undefined ? {} : { when: error.when }),
		})),
	};
	yield* fs.writeFileString(catalogPath, `${JSON.stringify(newCatalog, null, "\t")}\n`);

	yield* Console.log(`Migrated ${files.length} method error file(s) and errors.json to status-code tags.`);
});

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
