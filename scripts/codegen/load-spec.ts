import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Schema from "effect/Schema";
import { parseError } from "../parse/errors.ts";
import { Method, ObjectType } from "../parse/model.ts";

const decodeObject = Schema.decodeUnknownSync(ObjectType);
const decodeMethod = Schema.decodeUnknownSync(Method);

export const loadObjects = Effect.fn("loadObjects")(function* (specDir: string) {
	const fs = yield* FileSystem.FileSystem;
	const dir = `${specDir}/objects`;
	const files = (yield* fs.readDirectory(dir)).filter(entry => entry.endsWith(".json")).sort();

	const objects: ObjectType[] = [];
	for (const file of files) {
		const contents = yield* fs.readFileString(`${dir}/${file}`);
		objects.push(
			yield* Effect.try({
				try: () => decodeObject(JSON.parse(contents)),
				catch: cause => parseError(`Failed to decode ${dir}/${file}: ${String(cause)}`),
			}),
		);
	}
	return objects;
});

export const loadMethods = Effect.fn("loadMethods")(function* (specDir: string) {
	const fs = yield* FileSystem.FileSystem;
	const dir = `${specDir}/methods`;
	const files = (yield* fs.readDirectory(dir)).filter(entry => entry.endsWith(".json")).sort();

	const methods: Method[] = [];
	for (const file of files) {
		const contents = yield* fs.readFileString(`${dir}/${file}`);
		methods.push(
			yield* Effect.try({
				try: () => decodeMethod(JSON.parse(contents)),
				catch: cause => parseError(`Failed to decode ${dir}/${file}: ${String(cause)}`),
			}),
		);
	}
	return methods;
});
