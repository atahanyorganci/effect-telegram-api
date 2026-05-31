import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { parseError } from "./errors.ts";
import { ObjectType } from "./model.ts";
import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const parseEmptyObjectBlock = Effect.fn("parseEmptyObjectBlock")(function* (heading: HTMLElement) {
	const block = collectSectionBlock(heading);
	const name = heading.text.trim();
	const slug = heading.getAttribute("id");

	if (slug === undefined || slug.length === 0) {
		return yield* Effect.fail(parseError(`Object heading "${name}" is missing a slug id`));
	}

	const paragraphs = sectionElements(block, "p");
	const description = paragraphs[0]?.text.trim();

	if (description === undefined || description.length === 0) {
		return yield* Effect.fail(parseError(`Object "${name}" is missing a description paragraph`));
	}

	return yield* Schema.decodeEffect(ObjectType)({
		kind: "object",
		name,
		slug,
		description,
		fields: [],
	}).pipe(Effect.mapError(cause => parseError(`Invalid empty object "${name}": ${String(cause)}`)));
});
