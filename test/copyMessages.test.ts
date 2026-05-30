import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callCopyMessages = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.copyMessages, payload);

describe("copyMessages", () => {
	describe("success", () => {
		it.effect("returns copied message ids", () =>
			Effect.gen(function* () {
				const token = requireBotToken();
				const chatId = requireChatId();
				const source = yield* Telegram.Client.callMethod(token, Telegram.Methods.sendDice, { chat_id: chatId });
				const results = yield* callCopyMessages(token, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_ids: [source.message_id],
				});

				assert.ok(Array.isArray(results));
				assert.strictEqual(typeof results[0]?.message_id, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("FromChatIdRequired when from_chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callCopyMessages(requireBotToken(), {
					chat_id: requireChatId(),
					message_ids: [1],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.FromChatIdRequired>(
					error,
					"FromChatIdRequired",
					'Bad Request: parameter "from_chat_id" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NoMessagesToForward when message_ids does not exist", () =>
			Effect.gen(function* () {
				const chatId = requireChatId();
				const error = yield* callCopyMessages(requireBotToken(), {
					chat_id: chatId,
					from_chat_id: chatId,
					message_ids: [999_999_999],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoMessagesToForward>(
					error,
					"NoMessagesToForward",
					"Bad Request: there are no messages to forward",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callCopyMessages(token, { chat_id: 1, from_chat_id: 1, message_ids: [1] }));
});
