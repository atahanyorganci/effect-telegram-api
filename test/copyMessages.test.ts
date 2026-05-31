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

const callCopyMessages = (token: string, payload: unknown) => callClient("copyMessages", token, payload as never);

liveTests("copyMessages", test => {
	describe("success", () => {
		test.effect("returns copied message ids", () =>
			Effect.gen(function* () {
				const { botToken: token, chatId } = yield* telegramConfig;
				const source = yield* callClient("sendDice", token, { chat_id: chatId });
				const results = yield* callCopyMessages(token, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_ids: [source.message_id],
				});

				assert.ok(Array.isArray(results));
				assert.strictEqual(typeof results[0]?.message_id, "number");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("FromChatIdRequired when from_chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callCopyMessages(botToken, {
						chat_id: chatId,
						message_ids: [1],
					}),
				);
			}),
		);

		test.effect("NoMessagesToForward when message_ids does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callCopyMessages(botToken, {
					chat_id: chatId,
					from_chat_id: chatId,
					message_ids: [999_999_999],
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: there are no messages to forward");
			}),
		);
	});

	authErrorTests(test, token => callCopyMessages(token, { chat_id: 1, from_chat_id: 1, message_ids: [1] }));
});
