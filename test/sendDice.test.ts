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

const callSendDice = (token: string, payload: unknown) => callClient("sendDice", token, payload as never);

liveTests("sendDice", test => {
	describe("success", () => {
		test.effect("returns the sent dice message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendDice(botToken, { chat_id: chatId });

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.dice?.value, "number");
			}),
		);

		test.effect("returns the sent dice message in a forum topic", () =>
			Effect.gen(function* () {
				const { botToken, groupId, forumTopicId } = yield* telegramConfig;
				const message = yield* callSendDice(botToken, {
					chat_id: groupId,
					message_thread_id: forumTopicId,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.message_thread_id, forumTopicId);
				assert.strictEqual(typeof message.dice?.value, "number");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendDice(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendDice(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSendDice(token, { chat_id: 1 }));
});
