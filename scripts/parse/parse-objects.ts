import * as Effect from "effect/Effect";
import { parse } from "node-html-parser";
import { ParseError, parseError } from "./errors.ts";
import { findAvailableTypeHeadings } from "./find-objects.ts";
import { parseObjectBlock } from "./parse-object-block.ts";
import { writeObjectSpec } from "./write-spec.ts";
import type { ObjectType } from "./model.ts";

export interface ParsedObjects {
	readonly objects: readonly ObjectType[];
	readonly paths: readonly string[];
}

export const parseAvailableObjects = Effect.fn("parseAvailableObjects")(function* (html: string, specDir: string) {
	const article = parse(html).querySelector("article");

	if (article === null) {
		return yield* Effect.fail(parseError('Expected root element "article" in document'));
	}

	const headings = yield* Effect.try({
		try: () => findAvailableTypeHeadings(article),
		catch: (cause): ParseError => (cause instanceof ParseError ? cause : parseError(String(cause))),
	});

	const objects: ObjectType[] = [];
	const paths: string[] = [];

	for (const heading of headings) {
		const object = yield* parseObjectBlock(heading);
		const path = yield* writeObjectSpec(specDir, object);
		objects.push(object);
		paths.push(path);
	}

	return { objects, paths } satisfies ParsedObjects;
});
