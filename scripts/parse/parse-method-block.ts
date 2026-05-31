import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { parseError } from "./errors.ts";
import { isParameterTable } from "./is-parameter-table.ts";
import { Method } from "./model.ts";
import { methodProseBeforeTable, parseMethodDescription } from "./parse-method-prose.ts";
import { assertParameterTable, parseParameterRequired, parseParameterTableRows } from "./parse-parameter-table.ts";
import { parseReturnType } from "./parse-return-type.ts";
import { parseTypeCell } from "./parse-type-expr.ts";
import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const parseMethodBlock = Effect.fn("parseMethodBlock")(function* (heading: HTMLElement) {
	const block = collectSectionBlock(heading);
	const name = heading.text.trim();
	const slug = heading.getAttribute("id");

	if (slug === undefined || slug.length === 0) {
		return yield* Effect.fail(parseError(`Method heading "${name}" is missing a slug id`));
	}

	const paragraphs = sectionElements(block, "p");
	const prose = methodProseBeforeTable(paragraphs);

	if (prose.length === 0) {
		return yield* Effect.fail(parseError(`Method "${name}" is missing a description paragraph`));
	}

	const description = parseMethodDescription(prose);
	const returns = parseReturnType(paragraphs);
	const tables = sectionElements(block, "table").filter(isParameterTable);
	const notes = sectionElements(block, "blockquote")
		.map(note => note.text.trim())
		.filter(note => note.length > 0);

	if (tables.length > 1) {
		return yield* Effect.fail(
			parseError(`Method "${name}" expected at most 1 parameter table, found ${tables.length}`),
		);
	}

	const parameters =
		tables.length === 0
			? []
			: (() => {
					const table = tables[0]!;
					assertParameterTable(table);

					return parseParameterTableRows(table).map(row => ({
						name: row.nameCell.text.trim(),
						type: parseTypeCell(row.typeCell),
						required: parseParameterRequired(row.requiredCell.text),
						description: row.descriptionCell.text.trim(),
					}));
				})();

	return yield* Schema.decodeEffect(Method)({
		kind: "method",
		name,
		slug,
		description,
		parameters,
		returns,
		...(notes.length > 0 ? { notes } : {}),
	}).pipe(Effect.mapError(cause => parseError(`Invalid method "${name}": ${String(cause)}`)));
});
