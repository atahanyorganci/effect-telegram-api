import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Schema from "effect/Schema";
import { parseError } from "../parse/errors.ts";
import { Method, SpecType, type ObjectType, type UnionType } from "../parse/model.ts";

const decodeSpec = Schema.decodeUnknownSync(SpecType);
const decodeMethod = Schema.decodeUnknownSync(Method);

export interface LoadedSpec {
	readonly objects: readonly ObjectType[];
	readonly unions: readonly UnionType[];
}

export const loadSpec = Effect.fn("loadSpec")(function* (specDir: string) {
	const fs = yield* FileSystem.FileSystem;
	const dir = `${specDir}/schema`;
	const files = (yield* fs.readDirectory(dir)).filter(entry => entry.endsWith(".json")).sort();

	const objects: ObjectType[] = [];
	const unions: UnionType[] = [];

	for (const file of files) {
		const contents = yield* fs.readFileString(`${dir}/${file}`);
		const spec = yield* Effect.try({
			try: () => decodeSpec(JSON.parse(contents)),
			catch: cause => parseError(`Failed to decode ${dir}/${file}: ${String(cause)}`),
		});

		if (spec.kind === "object") {
			objects.push(spec);
		} else {
			unions.push(spec);
		}
	}

	return { objects, unions } satisfies LoadedSpec;
});

/** @deprecated Use {@link loadSpec} */
export const loadObjects = loadSpec;

export const loadMethods = Effect.fn("loadMethods")(function* (specDir: string) {
	const fs = yield* FileSystem.FileSystem;
	const dir = `${specDir}/endpoints`;
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
