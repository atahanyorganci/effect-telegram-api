import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";

export const loadDocument = Effect.fn("loadDocument")(function* (path: string) {
	const fs = yield* FileSystem.FileSystem;

	return yield* fs.readFileString(path);
});
