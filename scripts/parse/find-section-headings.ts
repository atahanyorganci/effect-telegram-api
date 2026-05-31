import { type HTMLElement, NodeType } from "node-html-parser";
import { parseError } from "./errors.ts";

export const findHeadingsInSections = (root: HTMLElement, sectionIds: readonly string[]): HTMLElement[] => {
	const pending = new Set(sectionIds);
	const headings: HTMLElement[] = [];

	for (const section of root.querySelectorAll("h3[id]")) {
		const sectionId = section.getAttribute("id");
		if (sectionId === undefined || !pending.has(sectionId)) {
			continue;
		}

		pending.delete(sectionId);

		const parent = section.parentNode;
		const start = parent.childNodes.indexOf(section);
		if (start < 0) {
			throw parseError(`Expected h3[id="${sectionId}"] to be present in its parent node`);
		}

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
	}

	const missing = sectionIds.filter(sectionId => pending.has(sectionId));
	if (missing.length > 0) {
		throw parseError(`Expected h3 section(s) in document: ${missing.map(id => `h3[id="${id}"]`).join(", ")}`);
	}

	return headings;
};
