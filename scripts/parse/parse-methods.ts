import * as Effect from "effect/Effect";
import { parse } from "node-html-parser";
import { ParseError, parseError } from "./errors.ts";
import { findAvailableMethodHeadings } from "./find-methods.ts";
import type { Method } from "./model.ts";
import { parseMethodBlock } from "./parse-method-block.ts";
import { writeMethodSpec } from "./write-method-spec.ts";

export interface ParsedMethods {
	readonly methods: readonly Method[];
	readonly paths: readonly string[];
}

export const parseAvailableMethods = Effect.fn("parseAvailableMethods")(function* (html: string, specDir: string) {
	const article = parse(html).querySelector("article");

	if (article === null) {
		return yield* Effect.fail(parseError('Expected root element "article" in document'));
	}

	const headings = yield* Effect.try({
		try: () => findAvailableMethodHeadings(article),
		catch: (cause): ParseError => (cause instanceof ParseError ? cause : parseError(String(cause))),
	});

	const methods: Method[] = [];
	const paths: string[] = [];

	for (const heading of headings) {
		const method = yield* parseMethodBlock(heading);
		const path = yield* writeMethodSpec(specDir, method);
		methods.push(method);
		paths.push(path);
	}

	return { methods, paths } satisfies ParsedMethods;
});
