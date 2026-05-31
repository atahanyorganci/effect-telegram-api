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

const callDeleteMessage = (token: string, payload: unknown) => callClient("deleteMessage", token, payload as never);

liveTests("deleteMessage", test => {
	describe("success", () => {
		test.effect("returns true when deleting a message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callClient("sendMessage", botToken, {
					chat_id: chatId,
					text: "telegram-api delete single",
				});

				const deleted = yield* callDeleteMessage(botToken, {
					chat_id: chatId,
					message_id: message.message_id,
				});

				assert.strictEqual(deleted, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToDeleteNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callDeleteMessage(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: message to delete not found");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callDeleteMessage(botToken, {
					chat_id: 0,
					message_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: chat not found");
			}),
		);
	});

	describe("client validation", () => {
		test.effect("requires chat_id and message_id", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callDeleteMessage(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callDeleteMessage(token, { chat_id: 1, message_id: 1 }));
});
