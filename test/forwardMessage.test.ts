import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callForwardMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.forwardMessage, payload);

describe("forwardMessage", () => {
	describe("success", () => {
		it.effect("returns the forwarded message", () =>
			Effect.gen(function* () {
				const token = requireBotToken();
				const chatId = requireChatId();
				const source = yield* Telegram.Client.callMethod(token, Telegram.Methods.sendDice, { chat_id: chatId });
				const message = yield* callForwardMessage(token, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_id: source.message_id,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.isDefined(message.forward_origin);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("FromChatIdRequired when from_chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callForwardMessage(requireBotToken(), {
					chat_id: requireChatId(),
					message_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.FromChatIdRequired>(
					error,
					"FromChatIdRequired",
					'Bad Request: parameter "from_chat_id" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToForwardNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const chatId = requireChatId();
				const error = yield* callForwardMessage(requireBotToken(), {
					chat_id: chatId,
					from_chat_id: chatId,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToForwardNotFound>(
					error,
					"MessageToForwardNotFound",
					"Bad Request: message to forward not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToForwardNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const chatId = requireChatId();
				const error = yield* callForwardMessage(requireBotToken(), {
					chat_id: chatId,
					from_chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToForwardNotFound>(
					error,
					"MessageToForwardNotFound",
					"Bad Request: message to forward not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callForwardMessage(requireBotToken(), {
					chat_id: 0,
					from_chat_id: 1,
					message_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callForwardMessage(token, { chat_id: 1, from_chat_id: 1, message_id: 1 }));
});
