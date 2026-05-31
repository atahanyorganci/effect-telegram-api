import * as Data from "effect/Data";

/**
 * Raised when Telegram responds with `{ "ok": false }` and the failure is not documented for the method.
 */
export class TelegramApiError extends Data.TaggedError("TelegramApiError")<{
	readonly errorCode: number;
	readonly description: string;
}> {}
