import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as Errors from "./Errors.ts";
import type * as Rpc from "effect/unstable/rpc/Rpc";

const BASE_URL = "https://api.telegram.org";

/** Raised when Telegram responds with `{ "ok": false }` and the code is not documented for the method. */
export class TelegramApiError extends Data.TaggedError("TelegramApiError")<{
	readonly errorCode: number;
	readonly description: string;
}> {}

const ErrorResponse = Schema.Struct({
	ok: Schema.Literal(false),
	error_code: Schema.Int,
	description: Schema.String,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const isUpload = (value: unknown): value is Uint8Array => value instanceof Uint8Array;

const hasUpload = (payload: unknown): payload is Record<string, unknown> =>
	isRecord(payload) && Object.values(payload).some(isUpload);

const appendFormValue = (formData: FormData, key: string, value: unknown) => {
	if (value === undefined || value === null) {
		return;
	}
	if (isUpload(value)) {
		formData.append(key, new Blob([Uint8Array.from(value)]), key);
		return;
	}
	if (typeof value === "string") {
		formData.append(key, value);
		return;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		formData.append(key, String(value));
		return;
	}
	formData.append(key, JSON.stringify(value));
};

const formDataFromPayload = (payload: Record<string, unknown>) => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(payload)) {
		appendFormValue(formData, key, value);
	}
	return formData;
};

const responseSchema = <S extends Schema.Top>(result: S) =>
	Schema.Union([Schema.Struct({ ok: Schema.Literal(true), result }), ErrorResponse]);

type Envelope<A> =
	| { readonly ok: true; readonly result: A }
	| { readonly ok: false; readonly error_code: number; readonly description: string };

const failFromEnvelope = (tag: string, error_code: number, description: string) => {
	const rules = Errors.methodErrors[tag as keyof typeof Errors.methodErrors];
	if (rules === undefined) {
		return Effect.fail(new TelegramApiError({ errorCode: error_code, description }));
	}

	type ErrorConstructor = new (args: { readonly description: string }) => { readonly description: string };

	const rule = rules.find(entry => entry.errorCode === error_code && entry.description === description);
	if (rule === undefined) {
		return Effect.fail(new TelegramApiError({ errorCode: error_code, description }));
	}

	return Effect.fail(new (rule.error as ErrorConstructor)({ description }));
};

/**
 * Invokes a Telegram Bot API method described by an `Rpc` definition. The
 * request body is the (optional) payload, and the `result` field of the
 * response envelope is decoded with the RPC's success schema.
 */
export const callMethod = Effect.fn("callMethod")(function* <
	Tag extends string,
	Payload extends Schema.Top,
	Success extends Schema.Top,
	Error extends Schema.Top = Schema.Never,
>(token: string, rpc: Rpc.Rpc<Tag, Payload, Success, Error>, payload?: unknown) {
	const base = HttpClientRequest.post(`${BASE_URL}/bot${token}/${rpc._tag}`);
	const request =
		payload === undefined
			? base
			: hasUpload(payload)
				? HttpClientRequest.bodyFormData(base, formDataFromPayload(payload))
				: yield* HttpClientRequest.bodyJson(base, payload);

	const response = yield* HttpClient.execute(request);
	const envelope = (yield* HttpClientResponse.schemaBodyJson(responseSchema(rpc.successSchema))(response)) as Envelope<
		Success["Type"]
	>;

	if (envelope.ok) {
		return envelope.result;
	}
	return yield* failFromEnvelope(rpc._tag, envelope.error_code, envelope.description);
});
