import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendMessage, payload);

describe("sendMessage", () => {
	describe("success", () => {
		it.effect("sends a message when chat_id and text are valid", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api test",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api test");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("sends a message that is 4096 characters long", () =>
			Effect.gen(function* () {
				const text = "x".repeat(4096);
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, text);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("MessageTextEmpty when text is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageTextEmpty>(
					error,
					"MessageTextEmpty",
					"Bad Request: message text is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { text: "test" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { chat_id: 0, text: "test" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageTooLong when text is longer than 4096 characters", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "x".repeat(4097),
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageTooLong>(error, "MessageTooLong", "Bad Request: message is too long");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendMessage(token, { chat_id: 1, text: "test" }));
});
