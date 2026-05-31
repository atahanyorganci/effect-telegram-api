import { classifyBlock } from "./classify-block.ts";
import { findHeadingsInSections } from "./find-section-headings.ts";
import type { HTMLElement } from "node-html-parser";

export const AVAILABLE_TYPES_SECTION_ID = "available-types";
export const GETTING_UPDATES_SECTION_ID = "getting-updates";
export const OBJECT_SECTION_IDS = [
	GETTING_UPDATES_SECTION_ID,
	AVAILABLE_TYPES_SECTION_ID,
	"stickers",
	"inline-mode",
	"payments",
	"games",
	"telegram-passport",
] as const;

export interface ClassifiedHeading {
	readonly heading: HTMLElement;
	readonly kind: NonNullable<ReturnType<typeof classifyBlock>>;
}

export const findAvailableTypeHeadings = (root: HTMLElement): ClassifiedHeading[] => {
	const headings = findHeadingsInSections(root, OBJECT_SECTION_IDS);

	return headings.flatMap(heading => {
		const kind = classifyBlock(heading);
		return kind === undefined ? [] : [{ heading, kind }];
	});
};
