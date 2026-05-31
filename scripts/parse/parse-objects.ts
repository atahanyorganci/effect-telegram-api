import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { parse } from "node-html-parser";
import { ParseError, parseError } from "./errors.ts";
import { findAvailableTypeHeadings } from "./find-objects.ts";
import { parseEmptyObjectBlock } from "./parse-empty-object-block.ts";
import { parseObjectBlock } from "./parse-object-block.ts";
import { parseUnionBlock } from "./parse-union-block.ts";
import { writeSpec } from "./write-spec.ts";
import type { ObjectType, UnionType } from "./model.ts";

export interface ParsedSpec {
	readonly objects: readonly ObjectType[];
	readonly unions: readonly UnionType[];
	readonly paths: readonly string[];
}

const cleanSchemaDir = Effect.fn("cleanSchemaDir")(function* (specDir: string) {
	const fs = yield* FileSystem.FileSystem;
	const schemaDir = `${specDir}/schema`;

	if (!(yield* fs.exists(schemaDir))) {
		return;
	}

	for (const entry of yield* fs.readDirectory(schemaDir)) {
		if (entry.endsWith(".json")) {
			yield* fs.remove(`${schemaDir}/${entry}`);
		}
	}
});

export const parseAvailableObjects = Effect.fn("parseAvailableObjects")(function* (html: string, specDir: string) {
	const article = parse(html).querySelector("article");

	if (article === null) {
		return yield* Effect.fail(parseError('Expected root element "article" in document'));
	}

	yield* cleanSchemaDir(specDir);

	const headings = yield* Effect.try({
		try: () => findAvailableTypeHeadings(article),
		catch: (cause): ParseError => (cause instanceof ParseError ? cause : parseError(String(cause))),
	});

	const objects: ObjectType[] = [];
	const unions: UnionType[] = [];
	const paths: string[] = [];

	for (const { heading, kind } of headings) {
		switch (kind) {
			case "object": {
				const object = yield* parseObjectBlock(heading);
				const path = yield* writeSpec(specDir, object);
				objects.push(object);
				paths.push(path);
				break;
			}
			case "union": {
				const union = yield* parseUnionBlock(heading);
				const path = yield* writeSpec(specDir, union);
				unions.push(union);
				paths.push(path);
				break;
			}
			case "empty": {
				const object = yield* parseEmptyObjectBlock(heading);
				const path = yield* writeSpec(specDir, object);
				objects.push(object);
				paths.push(path);
				break;
			}
		}
	}

	return { objects, unions, paths } satisfies ParsedSpec;
});
