import type { TypeExpr } from "../parse/model.ts";

export const INPUT_FILE_TYPE = "InputFile";

export interface RenderRefStrategy {
	/** Render a reference to a named object schema (e.g. `Message`). */
	readonly schemaRef: (name: string) => string;
	/** Render a reference to the `InputFile` schema. */
	readonly fileSchema: () => string;
}

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
		default:
			return;
	}
};
