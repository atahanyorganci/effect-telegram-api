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

const callPinChatMessage = (token: string, payload: unknown) => callClient("pinChatMessage", token, payload as never);

liveTests("pinChatMessage", test => {
	describe("success", () => {
		test.effect("returns true when pinning a message", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const source = yield* callClient("sendDice", token, { chat_id: chatId });

				yield* callPinChatMessage(token, { chat_id: chatId, message_id: source.message_id }).pipe(
					Effect.tap(result => Effect.sync(() => assert.strictEqual(result, true))),
					Effect.ensuring(
						callClient("unpinChatMessage", token, {
							chat_id: chatId,
							message_id: source.message_id,
						}).pipe(Effect.ignore),
					),
				);
			}),
		);

		test.effect("returns true when pinning a message in the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken: token, groupId } = yield* telegramConfig;
				const source = yield* callClient("sendDice", token, { chat_id: groupId });

				yield* callPinChatMessage(token, { chat_id: groupId, message_id: source.message_id }).pipe(
					Effect.tap(result => Effect.sync(() => assert.strictEqual(result, true))),
					Effect.ensuring(
						callClient("unpinChatMessage", token, {
							chat_id: groupId,
							message_id: source.message_id,
						}).pipe(Effect.ignore),
					),
				);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToPinNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callPinChatMessage(botToken, { chat_id: chatId }));
			}),
		);

		test.effect("MessageToPinNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callPinChatMessage(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageToPinNotFound", "Bad Request: message to pin not found");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callPinChatMessage(botToken, { chat_id: 0, message_id: 1 }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);
	});

	authErrorTests(test, token => callPinChatMessage(token, { chat_id: 1, message_id: 1 }));
});
