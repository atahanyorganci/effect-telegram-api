import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { schemaSpecPath } from "../document.ts";
import type { ObjectType } from "./model.ts";

export const writeObjectSpec = Effect.fn("writeObjectSpec")(function* (specDir: string, object: ObjectType) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const filePath = schemaSpecPath(specDir, object.name);
	const directory = path.dirname(filePath);

	if (directory !== ".") {
		yield* fs.makeDirectory(directory, { recursive: true });
	}

	yield* fs.writeFileString(filePath, `${JSON.stringify(object, null, "\t")}\n`);

	return filePath;
});
