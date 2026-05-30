import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { TelegramApiError } from "../src/Client.ts";
import type * as Telegram from "../src/index.ts";

export const LiveLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

export const requireBotToken = (): string => {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	if (token === undefined || token === "") {
		assert.fail("TELEGRAM_BOT_TOKEN is not set (add it to .env)");
	}
	return token;
};

/** Numeric id or @username string for sendMessage / getChat success tests. */
export const requireChatId = (): number | string => {
	const raw = process.env.TELEGRAM_CHAT_ID;
	if (raw === undefined || raw === "") {
		assert.fail("TELEGRAM_CHAT_ID is not set (add it to .env — your user id or @channelusername)");
	}
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : raw;
};

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
	assert.strictEqual((error as T)._tag, tag);
	assert.strictEqual((error as T).description, description);
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
