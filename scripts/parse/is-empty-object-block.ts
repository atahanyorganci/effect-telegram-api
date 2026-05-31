import { isFieldTable } from "./is-field-table.ts";
import { isUnionBlock } from "./is-union-block.ts";
import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const isEmptyObjectBlock = (heading: HTMLElement): boolean => {
	if (isUnionBlock(heading)) {
		return false;
	}

	const block = collectSectionBlock(heading);
	const tables = sectionElements(block, "table");

	if (tables.some(table => isFieldTable(table))) {
		return false;
	}

	const paragraphs = sectionElements(block, "p");
	return paragraphs.some(paragraph => paragraph.text.trim().length > 0);
};
