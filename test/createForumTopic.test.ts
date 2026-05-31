import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
	trackCreatedForumTopic,
} from "./helpers.ts";

const callCreateForumTopic = (token: string, payload: unknown) =>
	callClient("createForumTopic", token, payload as never);

liveTests("createForumTopic", test => {
	describe("Telegram API errors", () => {
		test.effect("NotEnoughRightsToCreateTopic when the bot cannot manage topics", () =>
			Effect.gen(function* () {
				const { limitedBotToken, groupId } = yield* telegramConfig;
				yield* callCreateForumTopic(limitedBotToken, {
					chat_id: groupId,
					name: "integration-test-topic",
				}).pipe(
					Effect.matchEffect({
						onFailure: error =>
							Effect.sync(() =>
								expectErrorTag(error, "BadRequest", "Bad Request: not enough rights to create a topic"),
							),
						onSuccess: topic =>
							Effect.gen(function* () {
								trackCreatedForumTopic(topic.message_thread_id);
								return yield* Effect.die("expected NotEnoughRightsToCreateTopic but the topic was created");
							}),
					}),
				);
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callCreateForumTopic(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callCreateForumTopic(token, { chat_id: 0, name: "test" }));
});
