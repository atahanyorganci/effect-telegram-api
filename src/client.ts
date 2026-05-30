import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import type * as Rpc from "effect/unstable/rpc/Rpc";

const BASE_URL = "https://api.telegram.org";

/** Raised when Telegram responds with `{ "ok": false }`. */
export class TelegramApiError extends Data.TaggedError("TelegramApiError")<{
	readonly errorCode: number;
	readonly description: string;
}> {}

const ErrorResponse = Schema.Struct({
	ok: Schema.Literal(false),
	error_code: Schema.Int,
	description: Schema.String,
});

const responseSchema = <S extends Schema.Top>(result: S) =>
	Schema.Union([Schema.Struct({ ok: Schema.Literal(true), result }), ErrorResponse]);

type Envelope<A> =
	| { readonly ok: true; readonly result: A }
	| { readonly ok: false; readonly error_code: number; readonly description: string };

/**
 * Invokes a Telegram Bot API method described by an `Rpc` definition. The
 * request body is the (optional) payload, and the `result` field of the
 * response envelope is decoded with the RPC's success schema.
 */
export const callMethod = Effect.fn("callMethod")(function* <
	Tag extends string,
	Payload extends Schema.Top,
	Success extends Schema.Top,
>(token: string, rpc: Rpc.Rpc<Tag, Payload, Success>, payload?: unknown) {
	const base = HttpClientRequest.post(`${BASE_URL}/bot${token}/${rpc._tag}`);
	const request = payload === undefined ? base : yield* HttpClientRequest.bodyJson(base, payload);

	const response = yield* HttpClient.execute(request);
	const envelope = (yield* HttpClientResponse.schemaBodyJson(responseSchema(rpc.successSchema))(response)) as Envelope<
		Success["Type"]
	>;

	if (envelope.ok) {
		return envelope.result;
	}
	return yield* new TelegramApiError({ errorCode: envelope.error_code, description: envelope.description });
});
