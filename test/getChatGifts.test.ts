import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callGetChatGifts = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getChatGifts, payload);

describe("getChatGifts", () => {
	describe("success", () => {
		it.effect("returns owned gifts for a valid chat_id", () =>
			Effect.gen(function* () {
				const gifts = yield* callGetChatGifts(requireBotToken(), { chat_id: requireChatId() });

				assert.strictEqual(typeof gifts.total_count, "number");
				assert.ok(Array.isArray(gifts.gifts));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callGetChatGifts(requireBotToken(), { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callGetChatGifts(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetChatGifts(token, { chat_id: 1 }));
});
