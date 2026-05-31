import { isEmptyObjectBlock } from "./is-empty-object-block.ts";
import { isMethodBlock } from "./is-method-block.ts";
import { isObjectBlock } from "./is-object-block.ts";
import { isUnionBlock } from "./is-union-block.ts";
import type { HTMLElement } from "node-html-parser";

const TYPE_NAME = /^[A-Z][A-Za-z0-9_]*$/;

export type BlockKind = "object" | "union" | "empty";

export const classifyBlock = (heading: HTMLElement): BlockKind | undefined => {
	if (isMethodBlock(heading)) {
		return undefined;
	}

	const name = heading.text.trim();

	if (!TYPE_NAME.test(name) || name === "InputFile") {
		return undefined;
	}

	if (isObjectBlock(heading)) {
		return "object";
	}

	if (isUnionBlock(heading)) {
		return "union";
	}

	if (isEmptyObjectBlock(heading)) {
		return "empty";
	}

	return undefined;
};
