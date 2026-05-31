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

const callCopyMessage = (token: string, payload: unknown) => callClient("copyMessage", token, payload as never);

liveTests("copyMessage", test => {
	describe("success", () => {
		test.effect("returns the new message id", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const source = yield* callClient("sendDice", token, { chat_id: chatId });
				const result = yield* callCopyMessage(token, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_id: source.message_id,
				});

				assert.strictEqual(typeof result.message_id, "number");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("FromChatIdRequired when from_chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callCopyMessage(botToken, {
						chat_id: chatId,
						message_id: 1,
					}),
				);
			}),
		);

		test.effect("MessageToCopyNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callCopyMessage(botToken, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: message to copy not found");
			}),
		);
	});

	authErrorTests(test, token => callCopyMessage(token, { chat_id: 1, from_chat_id: 1, message_id: 1 }));
});
