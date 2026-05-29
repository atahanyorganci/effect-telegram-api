import * as Data from "effect/Data";

export class ParseError extends Data.TaggedError("ParseError")<{
	readonly message: string;
}> {}

export const parseError = (message: string) => new ParseError({ message });
