import * as Schema from "effect/Schema";

export type TypeExpr =
	| { readonly kind: "integer" }
	| { readonly kind: "float" }
	| { readonly kind: "string" }
	| { readonly kind: "boolean" }
	| { readonly kind: "file" }
	| { readonly kind: "literal"; readonly value: boolean }
	| { readonly kind: "ref"; readonly name: string }
	| { readonly kind: "array"; readonly element: TypeExpr }
	| { readonly kind: "oneOf"; readonly types: readonly TypeExpr[] };

export const TypeExpr: Schema.Codec<TypeExpr> = Schema.suspend(() =>
	Schema.Union([
		Schema.Struct({ kind: Schema.Literal("integer") }),
		Schema.Struct({ kind: Schema.Literal("float") }),
		Schema.Struct({ kind: Schema.Literal("string") }),
		Schema.Struct({ kind: Schema.Literal("boolean") }),
		Schema.Struct({ kind: Schema.Literal("file") }),
		Schema.Struct({ kind: Schema.Literal("literal"), value: Schema.Boolean }),
		Schema.Struct({ kind: Schema.Literal("ref"), name: Schema.String }),
		Schema.Struct({ kind: Schema.Literal("array"), element: TypeExpr }),
		Schema.Struct({ kind: Schema.Literal("oneOf"), types: Schema.Array(TypeExpr) }),
	]),
);

export const Field = Schema.Struct({
	name: Schema.String,
	type: TypeExpr,
	required: Schema.Boolean,
	description: Schema.String,
	conditions: Schema.optional(Schema.Array(Schema.String)),
});
export type Field = Schema.Schema.Type<typeof Field>;

export const ObjectType = Schema.Struct({
	kind: Schema.Literal("object"),
	name: Schema.String,
	slug: Schema.String,
	description: Schema.String,
	fields: Schema.Array(Field),
});
export type ObjectType = Schema.Schema.Type<typeof ObjectType>;

export const UnionType = Schema.Struct({
	kind: Schema.Literal("union"),
	name: Schema.String,
	slug: Schema.String,
	description: Schema.String,
	members: Schema.Array(Schema.String),
});
export type UnionType = Schema.Schema.Type<typeof UnionType>;

export const SpecType = Schema.Union([ObjectType, UnionType]);
export type SpecType = Schema.Schema.Type<typeof SpecType>;

export const Parameter = Schema.Struct({
	name: Schema.String,
	type: TypeExpr,
	required: Schema.Boolean,
	description: Schema.String,
});
export type Parameter = Schema.Schema.Type<typeof Parameter>;

export const Method = Schema.Struct({
	kind: Schema.Literal("method"),
	name: Schema.String,
	slug: Schema.String,
	description: Schema.String,
	parameters: Schema.Array(Parameter),
	returns: TypeExpr,
	notes: Schema.optional(Schema.Array(Schema.String)),
});
export type Method = Schema.Schema.Type<typeof Method>;
