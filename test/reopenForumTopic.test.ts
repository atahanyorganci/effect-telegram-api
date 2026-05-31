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

const callReopenForumTopic = (token: string, payload: unknown) =>
	callClient("reopenForumTopic", token, payload as never);

liveTests("reopenForumTopic", test => {
	describe("Telegram API errors", () => {
		test.effect("NotEnoughRightsToCloseOrOpenTopic when the bot cannot manage the configured forum topic", () =>
			Effect.gen(function* () {
				const { botToken, groupId, forumTopicId } = yield* telegramConfig;
				const error = yield* callReopenForumTopic(botToken, {
					chat_id: groupId,
					message_thread_id: forumTopicId,
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"NotEnoughRightsToCloseOrOpenTopic",
					"Bad Request: not enough rights to close or open the topic",
				);
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callReopenForumTopic(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callReopenForumTopic(token, { chat_id: 0, message_thread_id: 0 }));
});
