import * as Schema from "effect/Schema";

export const MethodError = Schema.Struct({
	tag: Schema.String,
	errorCode: Schema.Int,
	description: Schema.String,
	when: Schema.optional(Schema.String),
});

export const MethodErrorsDoc = Schema.Struct({
	method: Schema.String,
	errors: Schema.Array(MethodError),
});

export const CommonErrorsDoc = Schema.Struct({
	errors: Schema.Array(MethodError),
});

export type MethodError = typeof MethodError.Type;
export type MethodErrorsDoc = typeof MethodErrorsDoc.Type;
export type CommonErrorsDoc = typeof CommonErrorsDoc.Type;
