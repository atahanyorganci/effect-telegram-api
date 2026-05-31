import { findHeadingsInSections } from "./find-section-headings.ts";
import { isObjectBlock } from "./is-object-block.ts";
import type { HTMLElement } from "node-html-parser";

export const AVAILABLE_TYPES_SECTION_ID = "available-types";
export const GETTING_UPDATES_SECTION_ID = "getting-updates";
export const OBJECT_SECTION_IDS = [GETTING_UPDATES_SECTION_ID, AVAILABLE_TYPES_SECTION_ID] as const;

export const findAvailableTypeHeadings = (root: HTMLElement): HTMLElement[] => {
	const headings = findHeadingsInSections(root, OBJECT_SECTION_IDS);

	return headings.filter(isObjectBlock);
};
