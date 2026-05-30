import * as Schema from "effect/Schema";

export const MethodErrorVariant = Schema.Struct({
	description: Schema.String,
	when: Schema.optional(Schema.String),
});

export const MethodError = Schema.Struct({
	tag: Schema.String,
	errorCode: Schema.Int,
	description: Schema.String,
	when: Schema.optional(Schema.String),
	variants: Schema.optional(Schema.Array(MethodErrorVariant)),
});

export const ErrorsDoc = Schema.Struct({
	common: Schema.Array(Schema.String),
	errors: Schema.Array(MethodError),
});

export const MethodErrorsRefDoc = Schema.Struct({
	method: Schema.String,
	errors: Schema.Array(Schema.String),
});

export const MethodErrorsDoc = Schema.Struct({
	method: Schema.String,
	errors: Schema.Array(
		Schema.Struct({
			tag: Schema.String,
			errorCode: Schema.Int,
			description: Schema.String,
			when: Schema.optional(Schema.String),
		}),
	),
});

export type MethodError = typeof MethodError.Type;
export type MethodErrorVariant = typeof MethodErrorVariant.Type;
export type ErrorsDoc = typeof ErrorsDoc.Type;
export type MethodErrorsRefDoc = typeof MethodErrorsRefDoc.Type;
export type MethodErrorsDoc = typeof MethodErrorsDoc.Type;

export const expandError = (error: MethodError): MethodErrorsDoc["errors"] => {
	const primary = {
		tag: error.tag,
		errorCode: error.errorCode,
		description: error.description,
		when: error.when,
	};
	const variants =
		error.variants?.map(variant => ({
			tag: error.tag,
			errorCode: error.errorCode,
			description: variant.description,
			when: variant.when,
		})) ?? [];
	return [primary, ...variants];
};
