import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callCopyMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.copyMessage, payload);

describe("copyMessage", () => {
	describe("success", () => {
		it.effect("returns the new message id", () =>
			Effect.gen(function* () {
				const token = requireBotToken();
				const chatId = requireChatId();
				const source = yield* Telegram.Client.callMethod(token, Telegram.Methods.sendDice, { chat_id: chatId });
				const result = yield* callCopyMessage(token, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_id: source.message_id,
				});

				assert.strictEqual(typeof result.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("FromChatIdRequired when from_chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callCopyMessage(requireBotToken(), {
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

		it.effect("MessageToCopyNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const chatId = requireChatId();
				const error = yield* callCopyMessage(requireBotToken(), {
					chat_id: chatId,
					from_chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToCopyNotFound>(
					error,
					"MessageToCopyNotFound",
					"Bad Request: message to copy not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callCopyMessage(token, { chat_id: 1, from_chat_id: 1, message_id: 1 }));
});
