import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { schemaSpecPath } from "../document.ts";
import type { SpecType } from "./model.ts";

export const writeSpec = Effect.fn("writeSpec")(function* (specDir: string, spec: SpecType) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const filePath = schemaSpecPath(specDir, spec.name);
	const directory = path.dirname(filePath);

	if (directory !== ".") {
		yield* fs.makeDirectory(directory, { recursive: true });
	}

	yield* fs.writeFileString(filePath, `${JSON.stringify(spec, null, "\t")}\n`);

	return filePath;
});

/** @deprecated Use {@link writeSpec} */
export const writeObjectSpec = writeSpec;
