import { parseError } from "./errors.ts";
import type { TypeExpr } from "./model.ts";
import type { HTMLElement } from "node-html-parser";

const PRIMITIVE_TYPES: Readonly<Record<string, TypeExpr>> = {
	Integer: { kind: "integer" },
	Float: { kind: "float" },
	String: { kind: "string" },
	Boolean: { kind: "boolean" },
	True: { kind: "literal", value: true },
	InputFile: { kind: "file" },
};

const parsePrimitive = (text: string): TypeExpr | undefined => PRIMITIVE_TYPES[text];

const parseTypeText = (text: string, cell: HTMLElement): TypeExpr => {
	const primitive = parsePrimitive(text);
	if (primitive !== undefined) {
		return primitive;
	}

	const link = cell.querySelectorAll('a[href^="#"]').find(anchor => anchor.text.trim() === text);
	if (link !== undefined) {
		return { kind: "ref", name: text };
	}

	throw parseError(`Unsupported type expression "${text}"`);
};

export const parseTypeExpression = (text: string, cell: HTMLElement): TypeExpr => {
	if (text.startsWith("Array of ")) {
		return {
			kind: "array",
			element: parseTypeExpression(text.slice("Array of ".length), cell),
		};
	}

	if (text.includes(" or ")) {
		return {
			kind: "oneOf",
			types: text.split(" or ").map(part => parseTypeText(part.trim(), cell)),
		};
	}

	return parseTypeText(text, cell);
};

export const parseTypeCell = (cell: HTMLElement): TypeExpr => {
	const link = cell.querySelector('a[href^="#"]');
	const text = cell.text.trim();

	if (link !== null && text === link.text.trim()) {
		return parseTypeText(text, cell);
	}

	return parseTypeExpression(text, cell);
};
