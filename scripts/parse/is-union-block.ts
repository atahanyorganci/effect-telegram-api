import { isFieldTable } from "./is-field-table.ts";
import { isMemberListUl } from "./member-list.ts";
import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const isUnionBlock = (heading: HTMLElement): boolean => {
	const block = collectSectionBlock(heading);
	const tables = sectionElements(block, "table");

	if (tables.some(table => isFieldTable(table))) {
		return false;
	}

	const lists = sectionElements(block, "ul");
	return lists.some(isMemberListUl);
};
