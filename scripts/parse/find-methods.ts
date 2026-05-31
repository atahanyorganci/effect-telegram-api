import { findHeadingsInSections } from "./find-section-headings.ts";
import { isMethodBlock } from "./is-method-block.ts";
import type { HTMLElement } from "node-html-parser";

export const AVAILABLE_METHODS_SECTION_ID = "available-methods";
export const GETTING_UPDATES_SECTION_ID = "getting-updates";
export const METHOD_SECTION_IDS = [GETTING_UPDATES_SECTION_ID, AVAILABLE_METHODS_SECTION_ID] as const;

export const findAvailableMethodHeadings = (root: HTMLElement): HTMLElement[] => {
	const headings = findHeadingsInSections(root, METHOD_SECTION_IDS);

	return headings.filter(isMethodBlock);
};
