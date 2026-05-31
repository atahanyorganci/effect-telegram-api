import type { Parameter, TypeExpr } from "../parse/model.ts";

export const INPUT_FILE_TYPE = "InputFile";

export const typeUsesMultipart = (type: TypeExpr): boolean => {
	switch (type.kind) {
		case "file":
			return true;
		case "array":
			return typeUsesMultipart(type.element);
		case "oneOf":
			return type.types.some(typeUsesMultipart);
		default:
			return false;
	}
};

export const methodUsesMultipart = (parameters: readonly Parameter[]): boolean =>
	parameters.some(parameter => typeUsesMultipart(parameter.type));

export interface RenderRefStrategy {
	/** Render a reference to a named object schema (e.g. `Message`). */
	readonly schemaRef: (name: string) => string;
	/** Render a reference to the `InputFile` schema. */
	readonly fileSchema: () => string;
}

export const escapeJsDoc = (text: string): string => text.trim().replace(/\*\//g, "*\\/");

const JSDOC_MAX_LINE_LENGTH = 80;

const wrapWords = (text: string, maxContentWidth: number): ReadonlyArray<string> => {
	const words = text.split(/\s+/).filter(word => word.length > 0);
	if (words.length === 0) {
		return [];
	}

	const lines: Array<string> = [];
	let current = words[0]!;

	for (const word of words.slice(1)) {
		const next = `${current} ${word}`;
		if (next.length <= maxContentWidth) {
			current = next;
			continue;
		}
		lines.push(current);
		current = word;
	}

	lines.push(current);
	return lines;
};

const wrapParagraph = (paragraph: string, maxContentWidth: number): ReadonlyArray<string> => {
	const normalized = paragraph.replace(/\s+/g, " ").trim();
	if (normalized.length === 0) {
		return [];
	}
	return wrapWords(normalized, maxContentWidth);
};

// Renders a multi-line JSDoc block when description is non-empty:
// newline after opening, max 80 columns per line without breaking words,
// newline before closing.
export const renderJsDoc = (description: string, indent = "", see?: string | readonly string[]): string => {
	const text = escapeJsDoc(description);
	const linePrefix = `${indent} * `;
	const maxContentWidth = Math.max(1, JSDOC_MAX_LINE_LENGTH - linePrefix.length);
	const descriptionLines =
		text.length === 0 ? [] : text.split(/\n/).flatMap(paragraph => wrapParagraph(paragraph, maxContentWidth));
	const seeUrls = see === undefined ? [] : typeof see === "string" ? [see] : [...see];
	const seeLines = seeUrls.filter(url => url.length > 0).map(url => `${linePrefix}@see ${url}`);
	const lines = [...descriptionLines, ...seeLines];

	if (lines.length === 0) {
		return "";
	}

	const body = lines.map(line => (line.startsWith(linePrefix) ? line : `${linePrefix}${line}`)).join("\n");
	return `${indent}/**\n${body}\n${indent} */\n`;
};

/** Wraps a schema expression with `Schema.annotate({ description })` when non-empty. */
export const renderAnnotatedSchemaExpr = (expr: string, description: string): string => {
	const text = description.trim();
	if (text.length === 0) {
		return expr;
	}
	return `${expr}.pipe(Schema.annotate({ description: ${JSON.stringify(text)} }))`;
};

export const renderSchemaExpr = (type: TypeExpr, strategy: RenderRefStrategy): string => {
	switch (type.kind) {
		case "integer":
			return "Schema.Int";
		case "float":
			return "Schema.Number";
		case "string":
			return "Schema.String";
		case "boolean":
			return "Schema.Boolean";
		case "file":
			return strategy.fileSchema();
		case "literal":
			return `Schema.Literal(${type.value})`;
		case "ref":
			return strategy.schemaRef(type.name);
		case "array":
			return `Schema.Array(${renderSchemaExpr(type.element, strategy)})`;
		case "oneOf":
			return `Schema.Union([${type.types.map(member => renderSchemaExpr(member, strategy)).join(", ")}])`;
	}
};

/**
 * Renders a `TypeExpr` as a TypeScript type. `knownNames` lists every named
 * schema that is actually generated; references to anything else resolve to
 * `unknown` (placeholder unions), and `unknown` is collapsed out of union types
 * to keep the output free of redundant constituents.
 */
export const renderTsType = (type: TypeExpr, knownNames: ReadonlySet<string>): string => {
	switch (type.kind) {
		case "integer":
		case "float":
			return "number";
		case "string":
			return "string";
		case "boolean":
			return "boolean";
		case "file":
			return INPUT_FILE_TYPE;
		case "literal":
			return `${type.value}`;
		case "ref":
			return knownNames.has(type.name) ? type.name : "unknown";
		case "array":
			return `ReadonlyArray<${renderTsType(type.element, knownNames)}>`;
		case "oneOf": {
			const members = type.types.map(member => renderTsType(member, knownNames));
			if (members.includes("unknown")) {
				return "unknown";
			}
			const unique = [...new Set(members)];
			return unique.length === 1 ? unique[0]! : `(${unique.join(" | ")})`;
		}
	}
};

export const collectRefs = (type: TypeExpr, into: Set<string>): void => {
	switch (type.kind) {
		case "ref":
			into.add(type.name);
			return;
		case "array":
			collectRefs(type.element, into);
			return;
		case "oneOf":
			for (const member of type.types) {
				collectRefs(member, into);
			}
			return;
		case "file":
			into.add(INPUT_FILE_TYPE);
			return;
		default:
			return;
	}
};
