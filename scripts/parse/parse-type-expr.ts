import { parseError } from "./errors.ts";
import type { TypeExpr } from "./model.ts";
import type { HTMLElement } from "node-html-parser";

export const parseTypeCell = (cell: HTMLElement): TypeExpr => {
	const link = cell.querySelector('a[href^="#"]');
	const text = cell.text.trim();

	if (link !== null && text === link.text.trim()) {
		const name = link.text.trim();
		if (name.length === 0) {
			throw parseError("Type reference is missing a name");
		}

		return { kind: "ref", name };
	}

	switch (text) {
		case "Integer":
			return { kind: "integer" };
		case "String":
			return { kind: "string" };
		case "Boolean":
			return { kind: "boolean" };
		case "True":
			return { kind: "literal", value: true };
		default:
			throw parseError(`Unsupported type expression "${text}"`);
	}
};
