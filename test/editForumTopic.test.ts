import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callEditForumTopic = (token: string, payload: unknown) => callClient("editForumTopic", token, payload as never);

liveTests("editForumTopic", test => {
	describe("Telegram API errors", () => {
		test.effect("NotEnoughRightsToEditTopic when the bot cannot manage the configured forum topic", () =>
			Effect.gen(function* () {
				const { limitedBotToken, groupId, forumTopicId } = yield* telegramConfig;
				const error = yield* callEditForumTopic(limitedBotToken, {
					chat_id: groupId,
					message_thread_id: forumTopicId,
					name: "probe-renamed-topic",
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: CHAT_ADMIN_REQUIRED");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callEditForumTopic(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callEditForumTopic(token, { chat_id: 0, message_thread_id: 0 }));
});
