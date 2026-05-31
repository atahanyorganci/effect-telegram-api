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

const callForwardMessage = (token: string, payload: unknown) => callClient("forwardMessage", token, payload as never);

liveTests("forwardMessage", test => {
	describe("success", () => {
		test.effect("returns the forwarded message", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const source = yield* callClient("sendDice", token, { chat_id: chatId });
				const message = yield* callForwardMessage(token, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_id: source.message_id,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.isDefined(message.forward_origin);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("FromChatIdRequired when from_chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callForwardMessage(botToken, {
						chat_id: chatId,
						message_id: 1,
					}),
				);
			}),
		);

		test.effect("MessageToForwardNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callForwardMessage(botToken, {
						chat_id: chatId,
						from_chat_id: chatId,
					}),
				);
			}),
		);

		test.effect("MessageToForwardNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callForwardMessage(botToken, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageToForwardNotFound", "Bad Request: message to forward not found");
			}),
		);

		test.effect("MessageThreadNotFound when message_thread_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, groupId, chatId } = yield* telegramConfig;
				const error = yield* callForwardMessage(botToken, {
					chat_id: groupId,
					from_chat_id: chatId,
					message_id: 1,
					message_thread_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageThreadNotFound", "Bad Request: message thread not found");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callForwardMessage(botToken, {
					chat_id: 0,
					from_chat_id: 1,
					message_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);
	});

	authErrorTests(test, token => callForwardMessage(token, { chat_id: 1, from_chat_id: 1, message_id: 1 }));
});
