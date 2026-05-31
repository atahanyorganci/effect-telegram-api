import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { parseError } from "./errors.ts";
import { isMemberListUl, parseMemberListUl } from "./member-list.ts";
import { UnionType } from "./model.ts";
import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const parseUnionBlock = Effect.fn("parseUnionBlock")(function* (heading: HTMLElement) {
	const block = collectSectionBlock(heading);
	const name = heading.text.trim();
	const slug = heading.getAttribute("id");

	if (slug === undefined || slug.length === 0) {
		return yield* Effect.fail(parseError(`Union heading "${name}" is missing a slug id`));
	}

	const paragraphs = sectionElements(block, "p");
	const description = paragraphs[0]?.text.trim();

	if (description === undefined || description.length === 0) {
		return yield* Effect.fail(parseError(`Union "${name}" is missing a description paragraph`));
	}

	const memberList = sectionElements(block, "ul").find(isMemberListUl);

	if (memberList === undefined) {
		return yield* Effect.fail(parseError(`Union "${name}" is missing a member list`));
	}

	const variants = parseMemberListUl(memberList);

	return yield* Schema.decodeEffect(UnionType)({
		kind: "union",
		name,
		slug,
		description,
		variants,
	}).pipe(Effect.mapError(cause => parseError(`Invalid union "${name}": ${String(cause)}`)));
});
