import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import { assert, describe, it } from "@effect/vitest";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as Rpc from "effect/unstable/rpc/Rpc";
import { appendFileSync, existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as Telegram from "../src/index.ts";
import type { TelegramApiError } from "../src/Client.ts";
import type * as TelegramTypes from "../src/index.ts";

/** Cross-worker registry of forum topics created during tests (not the configured fixture topic). */
export const createdForumTopicsRegistryPath = resolve(import.meta.dirname, ".artifacts/created-forum-topics.txt");

const bestEffort = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect.pipe(Effect.ignore);

export const LiveLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

/** Typed Telegram test env vars from `.env`. */
export const TelegramConfig = Config.all({
	botToken: Config.string("TELEGRAM_BOT_TOKEN"),
	chatId: Config.number("TELEGRAM_CHAT_ID"),
	groupId: Config.number("TELEGRAM_GROUP_CHAT_ID"),
	forumTopicId: Config.number("TELEGRAM_FORUM_TOPIC_ID"),
});

const telegramConfigProvider = ConfigProvider.fromUnknown(process.env);

export const telegramConfig = TelegramConfig.parse(telegramConfigProvider);

/** Test-only RPC until `deleteMessage` is in the generated spec. */
const deleteMessageRpc = Rpc.make("deleteMessage", {
	payload: Schema.Struct({
		chat_id: Schema.Union([Schema.Int, Schema.String]),
		message_id: Schema.Int,
	}),
	success: Schema.Literal(true),
});

/** Best-effort delete of a bot message created during a test. Ignores Telegram errors. */
export const deleteSentMessage = (token: string, chatId: number, messageId: number) =>
	Telegram.Client.callMethod(token, deleteMessageRpc, { chat_id: chatId, message_id: messageId }).pipe(Effect.ignore);

export const deleteSentMessages = (token: string, chatId: number, messageIds: readonly number[]) =>
	Effect.forEach(messageIds, messageId => deleteSentMessage(token, chatId, messageId), { discard: true });

export const clearMessageReaction = (token: string, chatId: number, messageId: number, messageThreadId?: number) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMessageReaction, {
		chat_id: chatId,
		message_id: messageId,
		...(messageThreadId === undefined ? {} : { message_thread_id: messageThreadId }),
		reaction: [],
	}).pipe(Effect.ignore);

export const restoreGroupDescription = (token: string, groupId: number, description: string) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatDescription, {
		chat_id: groupId,
		description,
	}).pipe(Effect.ignore);

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

/** Best-effort cleanup of pins and stray forum topics after the suite finishes. */
export const cleanupTestArtifacts = Effect.gen(function* () {
	const config = yield* Effect.option(telegramConfig);
	if (config._tag === "None") {
		return;
	}

	const { botToken, chatId, groupId, forumTopicId } = config.value;

	yield* bestEffort(Telegram.Client.callMethod(botToken, Telegram.Methods.unpinAllChatMessages, { chat_id: chatId }));
	yield* bestEffort(Telegram.Client.callMethod(botToken, Telegram.Methods.unpinAllChatMessages, { chat_id: groupId }));
	yield* bestEffort(
		Telegram.Client.callMethod(botToken, Telegram.Methods.unpinAllForumTopicMessages, {
			chat_id: groupId,
			message_thread_id: forumTopicId,
		}),
	);
	yield* bestEffort(
		Telegram.Client.callMethod(botToken, Telegram.Methods.unpinAllGeneralForumTopicMessages, { chat_id: groupId }),
	);
	yield* bestEffort(
		Telegram.Client.callMethod(botToken, Telegram.Methods.reopenForumTopic, {
			chat_id: groupId,
			message_thread_id: forumTopicId,
		}),
	);
	yield* bestEffort(
		Telegram.Client.callMethod(botToken, Telegram.Methods.reopenGeneralForumTopic, { chat_id: groupId }),
	);

	for (const messageThreadId of readTrackedForumTopicIds()) {
		if (messageThreadId === forumTopicId) {
			continue;
		}
		yield* bestEffort(
			Telegram.Client.callMethod(botToken, Telegram.Methods.deleteForumTopic, {
				chat_id: groupId,
				message_thread_id: messageThreadId,
			}),
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

export const expectErrorTag = <T extends { readonly _tag: string; readonly description: string }>(
	error: unknown,
	tag: T["_tag"],
	description: string,
) => {
	assert.strictEqual((error as T).description, description);
	assert.strictEqual((error as T)._tag, tag);
};

export const INVALID_BOT_TOKEN = "0000000000:INVALID_TOKEN";

type TestServices = Layer.Success<typeof LiveLayer>;

/** Live tests for invalid or malformed bot tokens (401 / 404). */
export const authErrorTests = (callWithToken: (token: string) => Effect.Effect<unknown, unknown, TestServices>) => {
	describe("authentication errors", () => {
		it.effect("Unauthorized when the token has bot id:hash form but the secret is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callWithToken(INVALID_BOT_TOKEN).pipe(Effect.flip);

				expectErrorTag<TelegramTypes.Errors.Unauthorized>(
					error,
					"Unauthorized",
					"Unauthorized: invalid token specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NotFound when the token segment is empty", () =>
			Effect.gen(function* () {
				const error = yield* callWithToken("").pipe(Effect.flip);

				expectErrorTag<TelegramTypes.Errors.NotFound>(error, "NotFound", "Not Found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NotFound when the token is not in bot id:hash form", () =>
			Effect.gen(function* () {
				const error = yield* callWithToken("not-a-valid-token").pipe(Effect.flip);

				expectErrorTag<TelegramTypes.Errors.NotFound>(error, "NotFound", "Not Found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
};
