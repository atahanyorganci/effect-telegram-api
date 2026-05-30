import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as HttpClient_ from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as HttpApiSchema from "effect/unstable/httpapi/HttpApiSchema";
import * as Errors from "./Errors.ts";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";

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

const failFromEnvelope = (method: string, error_code: number, description: string) => {
	const rules = Errors.methodErrors[method as keyof typeof Errors.methodErrors];
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

const successSchema = (endpoint: HttpApiEndpoint.AnyWithProps): Schema.Top => {
	const schemas = [...endpoint.success];
	return schemas[0] ?? HttpApiSchema.NoContent;
};

const decodeTelegramResult = (
	endpoint: HttpApiEndpoint.AnyWithProps,
	response: HttpClientResponse.HttpClientResponse,
) => {
	const schema = successSchema(endpoint);
	const envelope = HttpClientResponse.schemaBodyJson(responseSchema(schema));
	return Effect.flatMap(envelope(response), (decoded: Envelope<typeof schema.Type>) => {
		if (decoded.ok) {
			return Effect.succeed(decoded.result);
		}
		return failFromEnvelope(endpoint.name, decoded.error_code, decoded.description);
	});
};

/**
 * Invokes a Telegram Bot API method described by an `HttpApiEndpoint`. The
 * request body is the (optional) payload, and the `result` field of the
 * response envelope is decoded with the endpoint's success schema.
 */
export const callMethod = <Endpoint extends HttpApiEndpoint.AnyWithProps>(
	token: string,
	endpoint: Endpoint,
	payload?: unknown,
): Effect.Effect<
	HttpApiEndpoint.Success<Endpoint>["Type"],
	HttpApiEndpoint.Errors<Endpoint> | TelegramApiError,
	HttpClient.HttpClient
> =>
	Effect.gen(function* () {
		const base = HttpClientRequest.post(`${BASE_URL}/bot${token}/${endpoint.name}`);
		const request =
			payload === undefined
				? base
				: hasUpload(payload)
					? HttpClientRequest.bodyFormData(base, formDataFromPayload(payload))
					: yield* HttpClientRequest.bodyJson(base, payload);

		const response = yield* HttpClient_.execute(request);
		return yield* decodeTelegramResult(endpoint, response);
	}).pipe(Effect.withSpan("callMethod")) as Effect.Effect<
		HttpApiEndpoint.Success<Endpoint>["Type"],
		HttpApiEndpoint.Errors<Endpoint> | TelegramApiError,
		HttpClient.HttpClient
	>;
