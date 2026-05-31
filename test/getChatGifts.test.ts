import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callGetChatGifts = (token: string, payload: unknown) => callClient("getChatGifts", token, payload as never);

liveTests("getChatGifts", test => {
	describe("success", () => {
		test.effect("returns owned gifts for a valid chat_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const gifts = yield* callGetChatGifts(botToken, { chat_id: chatId });

				assert.strictEqual(typeof gifts.total_count, "number");
				assert.ok(Array.isArray(gifts.gifts));
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatGifts(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetChatGifts(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetChatGifts(token, { chat_id: 1 }));
});
