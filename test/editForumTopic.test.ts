import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callEditForumTopic = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.editForumTopic, payload);

describe("editForumTopic", () => {
	describe("Telegram API errors", () => {
		it.effect("NotEnoughRightsToEditTopic when the bot cannot manage the configured forum topic", () =>
			Effect.gen(function* () {
				const { botToken, groupId, forumTopicId } = yield* telegramConfig;
				const error = yield* callEditForumTopic(botToken, {
					chat_id: groupId,
					message_thread_id: forumTopicId,
					name: "probe-renamed-topic",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NotEnoughRightsToEditTopic>(
					error,
					"NotEnoughRightsToEditTopic",
					"Bad Request: not enough rights to edit the topic",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callEditForumTopic(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callEditForumTopic(token, { chat_id: 0, message_thread_id: 0 }));
});
