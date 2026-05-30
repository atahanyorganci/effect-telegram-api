import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callPinChatMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.pinChatMessage, payload);

describe("pinChatMessage", () => {
	describe("success", () => {
		it.effect("returns true when pinning a message", () =>
			Effect.gen(function* () {
				const token = requireBotToken();
				const chatId = requireChatId();
				const source = yield* Telegram.Client.callMethod(token, Telegram.Methods.sendDice, { chat_id: chatId });
				const result = yield* callPinChatMessage(token, { chat_id: chatId, message_id: source.message_id });

				assert.strictEqual(result, true);
				yield* Telegram.Client.callMethod(token, Telegram.Methods.unpinChatMessage, {
					chat_id: chatId,
					message_id: source.message_id,
				});
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("MessageToPinNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callPinChatMessage(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToPinNotFound>(
					error,
					"MessageToPinNotFound",
					"Bad Request: message to pin not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToPinNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callPinChatMessage(requireBotToken(), {
					chat_id: requireChatId(),
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToPinNotFound>(
					error,
					"MessageToPinNotFound",
					"Bad Request: message to pin not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callPinChatMessage(requireBotToken(), { chat_id: 0, message_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callPinChatMessage(token, { chat_id: 1, message_id: 1 }));
});
