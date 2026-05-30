import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import { assert, describe, it } from "@effect/vitest";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { TelegramApiError } from "../src/Client.ts";
import type * as Telegram from "../src/index.ts";

export const LiveLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

/** Typed Telegram test env vars. Group/forum ids are optional when unset in `.env`. */
export const TelegramConfig = Config.all({
	botToken: Config.string("TELEGRAM_BOT_TOKEN"),
	chatId: Config.number("TELEGRAM_CHAT_ID"),
	groupId: Config.string("TELEGRAM_GROUP_CHAT_ID"),
	forumTopicId: Config.string("TELEGRAM_FORUM_TOPIC_ID"),
});

const telegramConfigProvider = ConfigProvider.fromUnknown(process.env);

export const telegramConfig = TelegramConfig.parse(telegramConfigProvider);

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

				expectErrorTag<Telegram.Errors.Unauthorized>(error, "Unauthorized", "Unauthorized: invalid token specified");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NotFound when the token segment is empty", () =>
			Effect.gen(function* () {
				const error = yield* callWithToken("").pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NotFound>(error, "NotFound", "Not Found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NotFound when the token is not in bot id:hash form", () =>
			Effect.gen(function* () {
				const error = yield* callWithToken("not-a-valid-token").pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NotFound>(error, "NotFound", "Not Found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
};
