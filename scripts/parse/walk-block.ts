import { type HTMLElement, type Node, NodeType } from "node-html-parser";

export interface SectionBlock {
	readonly heading: HTMLElement;
	readonly nodes: readonly Node[];
}

export const collectSectionBlock = (heading: HTMLElement): SectionBlock => {
	const parent = heading.parentNode;
	const start = parent.childNodes.indexOf(heading);
	const nodes: Node[] = [heading];

	for (let index = start + 1; index < parent.childNodes.length; index++) {
		const node = parent.childNodes[index];

		if (node.nodeType === NodeType.ELEMENT_NODE) {
			const tag = (node as HTMLElement).tagName.toLowerCase();
			if (tag === "h3" || tag === "h4") {
				break;
			}
		}

		nodes.push(node);
	}

	return { heading, nodes };
};

export const sectionElements = (block: SectionBlock, tagName: string): HTMLElement[] =>
	block.nodes.filter(
		(node): node is HTMLElement =>
			node.nodeType === NodeType.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === tagName,
	);
