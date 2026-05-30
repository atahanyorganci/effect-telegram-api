import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetMessageReaction = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMessageReaction, payload);

describe("setMessageReaction", () => {
	describe("success", () => {
		it.effect("returns true when reacting to a message in a forum topic", () =>
			Effect.gen(function* () {
				const { botToken, groupId, forumTopicId } = yield* telegramConfig;
				const message = yield* Telegram.Client.callMethod(botToken, Telegram.Methods.sendDice, {
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
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("MessageToReactNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetMessageReaction(botToken, {
					chat_id: chatId,
					reaction: [],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToReactNotFound>(
					error,
					"MessageToReactNotFound",
					"Bad Request: message to react not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToReactNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetMessageReaction(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
					reaction: [],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToReactNotFound>(
					error,
					"MessageToReactNotFound",
					"Bad Request: message to react not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetMessageReaction(token, { chat_id: 1, message_id: 1, reaction: [] }));
});
