import { collectSectionBlock, sectionElements } from "./walk-block.ts";
import type { HTMLElement } from "node-html-parser";

export const isUnionBlock = (heading: HTMLElement): boolean => {
	const block = collectSectionBlock(heading);
	const paragraphs = sectionElements(block, "p");
	const lists = sectionElements(block, "ul");

	return lists.length > 0 && paragraphs.some(paragraph => paragraph.text.includes("can be one of"));
};
