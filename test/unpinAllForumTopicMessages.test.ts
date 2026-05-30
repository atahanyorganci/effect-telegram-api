import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callUnpinAllForumTopicMessages = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.unpinAllForumTopicMessages, payload);

describe("unpinAllForumTopicMessages", () => {
	describe("success", () => {
		it.effect("returns true for the configured forum topic", () =>
			Effect.gen(function* () {
				const { botToken, groupId, forumTopicId } = yield* telegramConfig;
				const result = yield* callUnpinAllForumTopicMessages(botToken, {
					chat_id: groupId,
					message_thread_id: forumTopicId,
				});

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callUnpinAllForumTopicMessages(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callUnpinAllForumTopicMessages(token, { chat_id: 0, message_thread_id: 0 }));
});
