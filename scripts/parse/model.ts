import * as Schema from "effect/Schema";

export const IntegerType = Schema.Struct({
	kind: Schema.Literal("integer"),
});

export const StringType = Schema.Struct({
	kind: Schema.Literal("string"),
});

export const BooleanType = Schema.Struct({
	kind: Schema.Literal("boolean"),
});

export const LiteralType = Schema.Struct({
	kind: Schema.Literal("literal"),
	value: Schema.Boolean,
});

export const RefType = Schema.Struct({
	kind: Schema.Literal("ref"),
	name: Schema.String,
});

export const TypeExpr = Schema.Union([IntegerType, StringType, BooleanType, LiteralType, RefType]);
export type TypeExpr = Schema.Schema.Type<typeof TypeExpr>;

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
