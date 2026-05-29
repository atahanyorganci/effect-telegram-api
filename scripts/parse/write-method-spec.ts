import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { methodSpecPath } from "../document.ts";
import type { Method } from "./model.ts";

export const writeMethodSpec = Effect.fn("writeMethodSpec")(function* (specDir: string, method: Method) {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;
	const filePath = methodSpecPath(specDir, method.name);
	const directory = path.dirname(filePath);

	if (directory !== ".") {
		yield* fs.makeDirectory(directory, { recursive: true });
	}

	yield* fs.writeFileString(filePath, `${JSON.stringify(method, null, "\t")}\n`);

	return filePath;
});
