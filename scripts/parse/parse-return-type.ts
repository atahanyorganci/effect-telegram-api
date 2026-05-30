import { parseError } from "./errors.ts";
import type { TypeExpr } from "./model.ts";
import type { HTMLElement } from "node-html-parser";

const PRIMITIVE_RETURN_TYPES: Readonly<Record<string, TypeExpr>> = {
	Integer: { kind: "integer" },
	Float: { kind: "float" },
	String: { kind: "string" },
	Boolean: { kind: "boolean" },
};

const normalizePrimitiveName = (typeName: string): string =>
	typeName.charAt(0).toUpperCase() + typeName.slice(1).toLowerCase();

const primitiveFromName = (typeName: string): TypeExpr | undefined => {
	if (typeName.toLowerCase() === "true") {
		return { kind: "literal", value: true };
	}

	if (typeName.toLowerCase() === "int") {
		return { kind: "integer" };
	}

	return PRIMITIVE_RETURN_TYPES[normalizePrimitiveName(typeName)];
};

const parsePrimitiveReturn = (text: string): TypeExpr | undefined => {
	const asMatch = text.match(/\bas\s+(Integer|String|Boolean|Float|True|Int)\b/i);
	if (asMatch !== null) {
		return primitiveFromName(asMatch[1]!);
	}

	const returnsMatch = text.match(/\bReturns\s+(Integer|String|Boolean|Float|True|Int)\b/i);
	if (returnsMatch !== null) {
		return primitiveFromName(returnsMatch[1]!);
	}

	return undefined;
};

const parseConditionalReturn = (paragraph: HTMLElement): TypeExpr | undefined => {
	const text = paragraph.text;

	if (!/\bis returned,\s*otherwise\s+True\s+is returned\b/i.test(text)) {
		return undefined;
	}

	const link = paragraph.querySelector('a[href^="#"]');
	if (link === null) {
		return undefined;
	}

	return {
		kind: "oneOf",
		types: [
			{ kind: "ref", name: link.text.trim() },
			{ kind: "literal", value: true },
		],
	};
};

const parseRefReturn = (paragraph: HTMLElement): TypeExpr | undefined => {
	const text = paragraph.text;
	const primitive = parsePrimitiveReturn(text);
	if (primitive !== undefined) {
		return primitive;
	}

	const conditional = parseConditionalReturn(paragraph);
	if (conditional !== undefined) {
		return conditional;
	}

	if (/Returns an Array of/i.test(text)) {
		const link = paragraph.querySelector('a[href^="#"]');
		if (link !== null) {
			return {
				kind: "array",
				element: { kind: "ref", name: link.text.trim() },
			};
		}
	}

	if (/Returns\s+True\b/i.test(text) || /\bTrue\s+is returned\b/i.test(text)) {
		return { kind: "literal", value: true };
	}

	if (/\bReturns\b/i.test(text) || /\bis returned\b/i.test(text)) {
		const links = paragraph.querySelectorAll('a[href^="#"]');
		const link = links[links.length - 1];
		if (link !== undefined) {
			return { kind: "ref", name: link.text.trim() };
		}
	}

	return undefined;
};

export const parseReturnType = (paragraphs: readonly HTMLElement[]): TypeExpr => {
	for (const paragraph of paragraphs) {
		const returnType = parseRefReturn(paragraph);
		if (returnType !== undefined) {
			return returnType;
		}
	}

	throw parseError(
		`Could not parse return type from method prose: ${paragraphs.map(paragraph => paragraph.text).join(" ")}`,
	);
};
