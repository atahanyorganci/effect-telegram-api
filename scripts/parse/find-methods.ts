import { findHeadingsInSections } from "./find-section-headings.ts";
import { isMethodBlock } from "./is-method-block.ts";
import type { HTMLElement } from "node-html-parser";

export const AVAILABLE_METHODS_SECTION_ID = "available-methods";
export const GETTING_UPDATES_SECTION_ID = "getting-updates";
export const UPDATING_MESSAGES_SECTION_ID = "updating-messages";
export const STICKERS_SECTION_ID = "stickers";
export const INLINE_MODE_SECTION_ID = "inline-mode";
export const PAYMENTS_SECTION_ID = "payments";
export const GAMES_SECTION_ID = "games";
export const TELEGRAM_PASSPORT_SECTION_ID = "telegram-passport";
export const METHOD_SECTION_IDS = [
	GETTING_UPDATES_SECTION_ID,
	AVAILABLE_METHODS_SECTION_ID,
	UPDATING_MESSAGES_SECTION_ID,
	STICKERS_SECTION_ID,
	INLINE_MODE_SECTION_ID,
	PAYMENTS_SECTION_ID,
	TELEGRAM_PASSPORT_SECTION_ID,
	GAMES_SECTION_ID,
] as const;

export const findAvailableMethodHeadings = (root: HTMLElement): HTMLElement[] => {
	const headings = findHeadingsInSections(root, METHOD_SECTION_IDS);

	return headings.filter(isMethodBlock);
};
