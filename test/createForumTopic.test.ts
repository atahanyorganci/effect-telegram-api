import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig, trackCreatedForumTopic } from "./helpers.ts";

const callCreateForumTopic = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.createForumTopic, payload);

describe("createForumTopic", () => {
	describe("Telegram API errors", () => {
		it.effect("NotEnoughRightsToCreateTopic when the bot cannot manage topics", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				yield* callCreateForumTopic(botToken, {
					chat_id: groupId,
					name: "integration-test-topic",
				}).pipe(
					Effect.matchEffect({
						onFailure: error =>
							Effect.sync(() =>
								expectErrorTag<Telegram.Errors.NotEnoughRightsToCreateTopic>(
									error,
									"NotEnoughRightsToCreateTopic",
									"Bad Request: not enough rights to create a topic",
								),
							),
						onSuccess: topic =>
							Effect.gen(function* () {
								trackCreatedForumTopic(topic.message_thread_id);
								return yield* Effect.die("expected NotEnoughRightsToCreateTopic but the topic was created");
							}),
					}),
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callCreateForumTopic(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callCreateForumTopic(token, { chat_id: 0, name: "test" }));
});
