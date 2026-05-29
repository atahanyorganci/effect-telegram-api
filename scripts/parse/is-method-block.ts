import { isObjectBlock } from "./is-object-block.ts";
import { isParameterTable } from "./is-parameter-table.ts";
import { isUnionBlock } from "./is-union-block.ts";
import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const isMethodBlock = (heading: HTMLElement): boolean => {
	if (isObjectBlock(heading) || isUnionBlock(heading)) {
		return false;
	}

	const block = collectSectionBlock(heading);
	const tables = sectionElements(block, "table");

	if (tables.some(isParameterTable)) {
		return true;
	}

	const prose = sectionElements(block, "p")
		.map(paragraph => paragraph.text)
		.join(" ");

	return prose.includes("Requires no parameters") || prose.includes("Use this method");
};
