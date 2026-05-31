import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callDeleteAllMessageReactions = (token: string, payload: unknown) =>
	callClient("deleteAllMessageReactions", token, payload as never);

liveTests("deleteAllMessageReactions", test => {
	describe("success", () => {
		test.effect("returns true when removing all recent reactions from the bot in a forum topic", () =>
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

				const removed = yield* callDeleteAllMessageReactions(botToken, {
					chat_id: groupId,
					user_id: bot.id,
				});

				assert.strictEqual(removed, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ParticipantIdInvalid when user_id does not refer to a chat participant", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callDeleteAllMessageReactions(botToken, {
					chat_id: groupId,
					user_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: PARTICIPANT_ID_INVALID");
			}),
		);
	});

	authErrorTests(test, token => callDeleteAllMessageReactions(token, { chat_id: 1, user_id: 1 }));
});
