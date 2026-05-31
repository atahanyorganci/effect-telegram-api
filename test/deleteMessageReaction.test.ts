import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callDeleteMessageReaction = (token: string, payload: unknown) =>
	callClient("deleteMessageReaction", token, payload as never);

liveTests("deleteMessageReaction", test => {
	describe("success", () => {
		test.effect("returns true when removing the bot reaction from a forum topic message", () =>
			Effect.gen(function* () {
				const { botToken, groupId, forumTopicId } = yield* telegramConfig;
				const bot = yield* callClient("getMe", botToken);
				const message = yield* callClient("sendDice", botToken, {
					chat_id: groupId,
					message_thread_id: forumTopicId,
				});
				yield* callClient("setMessageReaction", botToken, {
					chat_id: groupId,
					message_id: message.message_id,
					reaction: [{ type: "emoji", emoji: "👍" }],
				});

				const removed = yield* callDeleteMessageReaction(botToken, {
					chat_id: groupId,
					message_id: message.message_id,
					user_id: bot.id,
				});

				assert.strictEqual(removed, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToDeleteReactionsNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callDeleteMessageReaction(botToken, {
					chat_id: groupId,
					message_id: 999_999_999,
					user_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageToDeleteReactionsNotFound", "Bad Request: message to delete reactions not found");
			}),
		);
	});

	authErrorTests(test, token => callDeleteMessageReaction(token, { chat_id: 1, message_id: 1, user_id: 1 }));
});
