import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callUnpinAllForumTopicMessages = (token: string, payload: unknown) =>
	callClient("unpinAllForumTopicMessages", token, payload as never);

liveTests("unpinAllForumTopicMessages", test => {
	describe("success", () => {
		test.effect("returns true for the configured forum topic", () =>
			Effect.gen(function* () {
				const { botToken, groupId, forumTopicId } = yield* telegramConfig;
				const result = yield* callUnpinAllForumTopicMessages(botToken, {
					chat_id: groupId,
					message_thread_id: forumTopicId,
				});

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callUnpinAllForumTopicMessages(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callUnpinAllForumTopicMessages(token, { chat_id: 0, message_thread_id: 0 }));
});
