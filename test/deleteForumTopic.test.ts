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

const callDeleteForumTopic = (token: string, payload: unknown) =>
	callClient("deleteForumTopic", token, payload as never);

liveTests("deleteForumTopic", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatWriteForbidden when the bot cannot delete a forum topic", () =>
			Effect.gen(function* () {
				const { limitedBotToken, groupId } = yield* telegramConfig;
				const error = yield* callDeleteForumTopic(limitedBotToken, {
					chat_id: groupId,
					message_thread_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: CHAT_WRITE_FORBIDDEN");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callDeleteForumTopic(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callDeleteForumTopic(token, { chat_id: 0, message_thread_id: 0 }));
});
