import { isFieldTable } from "./is-field-table.ts";
import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const isObjectBlock = (heading: HTMLElement): boolean => {
	const block = collectSectionBlock(heading);
	const tables = sectionElements(block, "table");

	return tables.length === 1 && isFieldTable(tables[0]!);
};
