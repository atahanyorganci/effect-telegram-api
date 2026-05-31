import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callDeleteMessages = (token: string, payload: unknown) => callClient("deleteMessages", token, payload as never);

liveTests("deleteMessages", test => {
	describe("success", () => {
		test.effect("returns true when deleting multiple messages", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const first = yield* callClient("sendMessage", botToken, {
					chat_id: chatId,
					text: "telegram-api delete first",
				});
				const second = yield* callClient("sendMessage", botToken, {
					chat_id: chatId,
					text: "telegram-api delete second",
				});

				const deleted = yield* callDeleteMessages(botToken, {
					chat_id: chatId,
					message_ids: [first.message_id, second.message_id],
				});

				assert.strictEqual(deleted, true);
			}),
		);

		test.effect("returns true when missing message ids are skipped", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const result = yield* callDeleteMessages(botToken, {
					chat_id: chatId,
					message_ids: [999_999_999],
				});

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("client validation", () => {
		test.effect("requires message_ids", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callDeleteMessages(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callDeleteMessages(token, { chat_id: 1, message_ids: [1] }));
});
