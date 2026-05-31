import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import { assert, it } from "@effect/vitest";
import * as Cause from "effect/Cause";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Result from "effect/Result";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import { appendFileSync, existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as TelegramClient from "../src/client/index.ts";
import type { TelegramApiError } from "../src/errors.ts";
import type { Vitest } from "@effect/vitest";

export const LiveLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

/** Typed Telegram test env vars from `.env`. */
export const TelegramConfig = Config.all({
	botToken: Config.string("TELEGRAM_BOT_TOKEN"),
	limitedBotToken: Config.string("TELEGRAM_LIMITED_BOT_TOKEN"),
	chatId: Config.number("TELEGRAM_CHAT_ID"),
	groupId: Config.number("TELEGRAM_GROUP_CHAT_ID"),
	forumTopicId: Config.number("TELEGRAM_FORUM_TOPIC_ID"),
});

export const telegramConfig = TelegramConfig.parse(ConfigProvider.fromUnknown(process.env));

export const INVALID_BOT_TOKEN = "0000000000:INVALID_TOKEN";

type TestServices = Layer.Success<typeof LiveLayer>;

/** Cross-worker registry of forum topics created during tests (not the configured fixture topic). */
export const createdForumTopicsRegistryPath = resolve(import.meta.dirname, ".artifacts/created-forum-topics.txt");

const bestEffort = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect.pipe(Effect.ignore);

/** True when Telegram (or the transport) responded with HTTP 429 Too Many Requests. */
export const isRateLimitedError = (error: unknown): boolean => {
	if (!HttpClientError.isHttpClientError(error)) {
		if (typeof error === "string") {
			return error.includes("429");
		}
		if (typeof error === "number") {
			return error === 429;
		}
		if (typeof error === "object" && error !== null && "message" in error) {
			return typeof error.message === "string" && error.message.includes("429");
		}
		return false;
	}
	return error.response?.status === 429 || error.message.includes("(429 ");
};

/**
 * Fast exponential backoff, then longer fixed delays when Telegram keeps returning 429.
 * Phase 1 delays: 1s, 2s, 4s, 8s. Phase 2 delays: 10s, 10s, 10s.
 */
const rateLimitRetrySchedule = Schedule.andThen(
	Schedule.exponential("1 second", 2).pipe(Schedule.take(4)),
	Schedule.spaced("10 seconds").pipe(Schedule.take(3)),
);

/** Retries live API calls when the failure is a 429 rate limit. */
export const retryOnRateLimit = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
	effect.pipe(
		Effect.retry({
			while: isRateLimitedError,
			schedule: rateLimitRetrySchedule,
		}),
	);

/** Node platform services plus a {@link Telegram.withToken} layer. */
export const layerWithToken = (token: string) => Layer.provideMerge(TelegramClient.withToken(token), LiveLayer);

/** Provides {@link Telegram.withToken}; requires {@link LiveLayer} in scope. */
export const withBotToken = <A, E>(token: string, run: Effect.Effect<A, E, TelegramClient.TelegramClient>) =>
	run.pipe(Effect.provide(TelegramClient.withToken(token)));

/** Runs an effect with `TELEGRAM_BOT_TOKEN`; requires {@link LiveLayer} in scope. */
export const withConfiguredBot = <A, E>(run: Effect.Effect<A, E, TelegramClient.TelegramClient>) =>
	Effect.gen(function* () {
		const { botToken } = yield* telegramConfig;
		return yield* withBotToken(botToken, run);
	});

/** Runs an effect with `TELEGRAM_LIMITED_BOT_TOKEN` (non-admin member in the test supergroup). */
export const withLimitedBot = <A, E>(run: Effect.Effect<A, E, TelegramClient.TelegramClient>) =>
	Effect.gen(function* () {
		const { limitedBotToken } = yield* telegramConfig;
		return yield* withBotToken(limitedBotToken, run);
	});

type TelegramClientService = (typeof TelegramClient.TelegramClient)["Service"];

type ClientMethodArgs<M extends keyof TelegramClientService> = TelegramClientService[M] extends (
	...args: infer A
) => unknown
	? A
	: never;

/** Calls a {@link TelegramClient} method with an explicit bot token. Requires {@link LiveLayer} in scope. */
export const callClient = <M extends keyof TelegramClientService>(
	method: M,
	token: string,
	...args: ClientMethodArgs<M>
): Effect.Effect<any, any, TestServices> =>
	withBotToken(
		token,
		retryOnRateLimit(
			Effect.gen(function* () {
				const client = yield* TelegramClient.TelegramClient;
				const fn = client[method] as (...methodArgs: ClientMethodArgs<M>) => ReturnType<TelegramClientService[M]>;
				return yield* fn(...args);
			}),
		),
	) as Effect.Effect<any, any, TestServices>;

/** Calls a {@link TelegramClient} method with `TELEGRAM_LIMITED_BOT_TOKEN`. Requires {@link LiveLayer} in scope. */
export const callLimitedClient = <M extends keyof TelegramClientService>(
	method: M,
	...args: ClientMethodArgs<M>
): Effect.Effect<any, any, TestServices> =>
	Effect.gen(function* () {
		const { limitedBotToken } = yield* telegramConfig;
		return yield* callClient(method, limitedBotToken, ...args);
	}) as Effect.Effect<any, any, TestServices>;

export const callGetMe = (token: string) => callClient("getMe", token);

const appendFormData = (form: FormData, key: string, value: unknown): void => {
	if (value === undefined) {
		return;
	}
	if (value instanceof FormData) {
		for (const [nestedKey, nestedValue] of value.entries()) {
			form.append(nestedKey, nestedValue);
		}
		return;
	}
	if (value instanceof Blob) {
		form.append(key, value);
		return;
	}
	if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
		form.append(key, new Blob([Uint8Array.from(value)]), `${key}.bin`);
		return;
	}
	if (value instanceof Uint8Array) {
		form.append(key, new Blob([Uint8Array.from(value)]), `${key}.bin`);
		return;
	}
	if (typeof value === "object" && value !== null) {
		form.append(key, JSON.stringify(value));
		return;
	}
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		typeof value === "bigint"
	) {
		form.append(key, String(value));
		return;
	}
	form.append(key, JSON.stringify(value));
};

/** Builds a multipart {@link FormData} payload for Telegram file upload methods. */
export const formDataPayload = (payload: Record<string, unknown> | FormData): FormData => {
	if (payload instanceof FormData) {
		return payload;
	}
	const form = new FormData();
	for (const [key, value] of Object.entries(payload)) {
		appendFormData(form, key, value);
	}
	return form;
};

/** Record a forum topic id when a test unexpectedly creates one (safe across vitest workers). */
export const trackCreatedForumTopic = (messageThreadId: number) => {
	mkdirSync(dirname(createdForumTopicsRegistryPath), { recursive: true });
	appendFileSync(createdForumTopicsRegistryPath, `${messageThreadId}\n`);
};

const readTrackedForumTopicIds = (): readonly number[] => {
	if (!existsSync(createdForumTopicsRegistryPath)) {
		return [];
	}
	return readFileSync(createdForumTopicsRegistryPath, "utf8")
		.split("\n")
		.map(line => line.trim())
		.filter(line => line.length > 0)
		.map(Number)
		.filter(id => Number.isInteger(id) && id > 0);
};

export const resetCreatedForumTopicsRegistry = () => {
	if (existsSync(createdForumTopicsRegistryPath)) {
		unlinkSync(createdForumTopicsRegistryPath);
	}
};

export const clearMessageReaction = (token: string, chatId: number, messageId: number, messageThreadId?: number) =>
	callClient("setMessageReaction", token, {
		chat_id: chatId,
		message_id: messageId,
		...(messageThreadId === undefined ? {} : { message_thread_id: messageThreadId }),
		reaction: [],
	}).pipe(Effect.ignore);

export const restoreGroupDescription = (token: string, groupId: number, description: string) =>
	callClient("setChatDescription", token, { chat_id: groupId, description }).pipe(Effect.ignore);

/** Best-effort cleanup of pins and stray forum topics after the suite finishes. */
export const cleanupTestArtifacts = Effect.gen(function* () {
	const config = yield* Effect.option(telegramConfig);
	if (config._tag === "None") {
		return;
	}

	const { botToken, chatId, groupId, forumTopicId } = config.value;

	yield* bestEffort(callClient("unpinAllChatMessages", botToken, { chat_id: chatId }));
	yield* bestEffort(callClient("unpinAllChatMessages", botToken, { chat_id: groupId }));
	yield* bestEffort(
		callClient("unpinAllForumTopicMessages", botToken, { chat_id: groupId, message_thread_id: forumTopicId }),
	);
	yield* bestEffort(callClient("unpinAllGeneralForumTopicMessages", botToken, { chat_id: groupId }));
	yield* bestEffort(callClient("reopenForumTopic", botToken, { chat_id: groupId, message_thread_id: forumTopicId }));
	yield* bestEffort(callClient("reopenGeneralForumTopic", botToken, { chat_id: groupId }));

	for (const messageThreadId of readTrackedForumTopicIds()) {
		if (messageThreadId === forumTopicId) {
			continue;
		}
		yield* bestEffort(
			callClient("deleteForumTopic", botToken, { chat_id: groupId, message_thread_id: messageThreadId }),
		);
	}

	resetCreatedForumTopicsRegistry();
}).pipe(Effect.provide(LiveLayer));

export const expectTelegramApiError = (
	error: unknown,
	expected: { readonly errorCode: number; readonly description: string },
) => {
	assert.strictEqual((error as TelegramApiError)._tag, "TelegramApiError");
	assert.strictEqual((error as TelegramApiError).errorCode, expected.errorCode);
	assert.strictEqual((error as TelegramApiError).description, expected.description);
};

export const expectErrorTag = (error: unknown, tag: string, description: string) => {
	assert.strictEqual((error as { readonly description: string }).description, description);
	assert.strictEqual((error as { readonly _tag: string })._tag, tag);
};

const isSchemaErrorDefect = (value: unknown): boolean =>
	Schema.isSchemaError(value) ||
	(typeof value === "object" &&
		value !== null &&
		"_tag" in value &&
		(value as { readonly _tag: string })._tag === "SchemaError");

export const expectSchemaDie = (exit: Exit.Exit<unknown, unknown>) => {
	assert.strictEqual(Exit.isFailure(exit), true);
	if (!Exit.isFailure(exit)) {
		return;
	}
	const defect = Result.getOrNull(Cause.findDefect(exit.cause));
	assert.notStrictEqual(defect, null);
	assert.strictEqual(isSchemaErrorDefect(defect), true);
};

/** Runs a client call and asserts that payload encoding fails with {@link Schema.SchemaError}. */
export const expectClientSchemaError = (call: Effect.Effect<unknown, unknown, TestServices>) =>
	call.pipe(
		Effect.exit,
		Effect.tap(exit => Effect.sync(() => expectSchemaDie(exit))),
		Effect.asVoid,
	);

/** Live tests for invalid or malformed bot tokens (401 / 404). */
export const authErrorTests = (
	test: Pick<Vitest.MethodsNonLive<TestServices>, "effect">,
	callWithToken: (token: string) => Effect.Effect<unknown, unknown, TestServices>,
) => {
	test.effect("returns Unauthorized when the token has bot id:hash form but the secret is invalid", () =>
		Effect.gen(function* () {
			const error = yield* callWithToken(INVALID_BOT_TOKEN).pipe(Effect.flip);

			expectErrorTag(error, "Unauthorized", "Unauthorized: invalid token specified");
		}),
	);

	test.effect("returns NotFound when the token segment is empty", () =>
		Effect.gen(function* () {
			const error = yield* callWithToken("").pipe(Effect.flip);

			expectErrorTag(error, "NotFound", "Not Found");
		}),
	);

	test.effect("returns NotFound when the token is not in bot id:hash form", () =>
		Effect.gen(function* () {
			const error = yield* callWithToken("not-a-valid-token").pipe(Effect.flip);

			expectErrorTag(error, "NotFound", "Not Found");
		}),
	);
};

/** Shared platform layer for live Telegram integration tests. */
export const liveTests = (name: string, run: (test: Pick<Vitest.MethodsNonLive<TestServices>, "effect">) => void) =>
	it.layer(LiveLayer)(name, run);
