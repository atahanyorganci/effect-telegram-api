import { type HTMLElement, NodeType } from "node-html-parser";
import { parseError } from "./errors.ts";
import { isObjectBlock } from "./is-object-block.ts";

export const AVAILABLE_TYPES_SECTION_ID = "available-types";

export const findAvailableTypeHeadings = (root: HTMLElement): HTMLElement[] => {
	const section = root.querySelector(`h3[id="${AVAILABLE_TYPES_SECTION_ID}"]`);

	if (section === null) {
		throw parseError(`Expected h3[id="${AVAILABLE_TYPES_SECTION_ID}"] in document`);
	}

	const headings: HTMLElement[] = [];
	const parent = section.parentNode;
	const start = parent.childNodes.indexOf(section);

	for (let index = start + 1; index < parent.childNodes.length; index++) {
		const node = parent.childNodes[index];

		if (node.nodeType !== NodeType.ELEMENT_NODE) {
			continue;
		}

		const element = node as HTMLElement;
		const tag = element.tagName.toLowerCase();

		if (tag === "h3") {
			break;
		}

		if (tag === "h4" && element.getAttribute("id") !== undefined) {
			headings.push(element);
		}
	}

	return headings.filter(isObjectBlock);
};
