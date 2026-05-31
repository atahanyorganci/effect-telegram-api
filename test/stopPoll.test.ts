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

const callStopPoll = (token: string, payload: unknown) => callClient("stopPoll", token, payload as never);

liveTests("stopPoll", test => {
	describe("success", () => {
		test.effect("returns the stopped poll", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callClient("sendPoll", botToken, {
					chat_id: chatId,
					question: "telegram-api stop poll?",
					options: [{ text: "yes" }, { text: "no" }],
				});
				assert.notStrictEqual(message.poll, undefined);

				const poll = yield* callStopPoll(botToken, {
					chat_id: chatId,
					message_id: message.message_id,
				});

				assert.strictEqual(poll.id, message.poll!.id);
				assert.strictEqual(poll.is_closed, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MessageWithPollToStopNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callStopPoll(botToken, {
					chat_id: chatId,
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageWithPollToStopNotFound", "Bad Request: message with poll to stop not found");
			}),
		);
	});

	describe("client validation", () => {
		test.effect("requires message_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callStopPoll(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callStopPoll(token, { chat_id: 1, message_id: 1 }));
});
