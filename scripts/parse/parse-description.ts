import type { HTMLElement } from "node-html-parser";

export interface ParsedDescription {
	readonly required: boolean;
	readonly description: string;
	readonly conditions?: readonly string[];
}

const optionalPrefix = /^Optional\.\s*/i;
const returnedOnlyIn = /\s*Returned only in ([^.]+)\.\s*$/;

export const parseDescriptionCell = (cell: HTMLElement): ParsedDescription => {
	const text = cell.text.trim();
	const required = !optionalPrefix.test(text);
	let description = text.replace(optionalPrefix, "");

	const match = description.match(returnedOnlyIn);
	if (match === null) {
		return { required, description };
	}

	const condition = `Returned only in ${match[1]!.trim()}`;
	description = description.replace(returnedOnlyIn, "").trim();

	return { required, description, conditions: [condition] };
};
