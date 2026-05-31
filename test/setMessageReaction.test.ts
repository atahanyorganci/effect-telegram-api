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

const callSetMessageReaction = (token: string, payload: unknown) =>
	callClient("setMessageReaction", token, payload as never);

liveTests("setMessageReaction", test => {
	describe("success", () => {
		test.effect("returns true when reacting to a message in a forum topic", () =>
			Effect.gen(function* () {
				const { botToken, groupId, forumTopicId } = yield* telegramConfig;
				const message = yield* callClient("sendDice", botToken, {
					chat_id: groupId,
					message_thread_id: forumTopicId,
				});
				const result = yield* callSetMessageReaction(botToken, {
					chat_id: groupId,
					message_id: message.message_id,
					message_thread_id: forumTopicId,
					reaction: [{ type: "emoji", emoji: "👍" }],
				});

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageToReactNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSetMessageReaction(botToken, {
						chat_id: chatId,
						reaction: [],
					}),
				);
			}),
		);

		test.effect("MessageToReactNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetMessageReaction(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
					reaction: [],
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: message to react not found");
			}),
		);
	});

	authErrorTests(test, token => callSetMessageReaction(token, { chat_id: 1, message_id: 1, reaction: [] }));
});
