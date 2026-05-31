import * as Schema from "effect/Schema";

export const MethodError = Schema.Struct({
	tag: Schema.String,
	errorCode: Schema.Int,
	when: Schema.optional(Schema.String),
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
	errors: Schema.Array(MethodError),
});

export type MethodError = typeof MethodError.Type;
export type ErrorsDoc = typeof ErrorsDoc.Type;
export type MethodErrorsRefDoc = typeof MethodErrorsRefDoc.Type;
export type MethodErrorsDoc = typeof MethodErrorsDoc.Type;
