import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { parseError } from "./errors.ts";
import { ObjectType } from "./model.ts";
import { parseDescriptionCell } from "./parse-description.ts";
import { assertFieldTable, parseFieldTableRows } from "./parse-table.ts";
import { parseTypeCell } from "./parse-type-expr.ts";
import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const parseObjectBlock = Effect.fn("parseObjectBlock")(function* (heading: HTMLElement) {
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

	const tables = sectionElements(block, "table");
	if (tables.length !== 1) {
		return yield* Effect.fail(parseError(`Object "${name}" expected 1 field table, found ${tables.length}`));
	}

	const table = tables[0]!;

	try {
		assertFieldTable(table);
	} catch (error) {
		return yield* Effect.fail(error);
	}

	const fields = parseFieldTableRows(table).map(row => ({
		name: row.fieldCell.text.trim(),
		type: parseTypeCell(row.typeCell),
		...parseDescriptionCell(row.descriptionCell),
	}));

	return yield* Schema.decodeEffect(ObjectType)({
		kind: "object",
		name,
		slug,
		description,
		fields,
	}).pipe(Effect.mapError(cause => parseError(`Invalid object "${name}": ${String(cause)}`)));
});
