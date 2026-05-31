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

const callSendPoll = (token: string, payload: unknown) => callClient("sendPoll", token, payload as never);

liveTests("sendPoll", test => {
	describe("success", () => {
		test.effect("returns the sent poll message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendPoll(botToken, {
					chat_id: chatId,
					question: "Favorite color?",
					options: [{ text: "Red" }, { text: "Blue" }],
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.poll?.id, "string");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("TextMustBeNonEmpty when question is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendPoll(botToken, {
						chat_id: chatId,
						options: [{ text: "A" }, { text: "B" }],
					}),
				);
			}),
		);

		test.effect("CantParseOptionsJsonObject when options is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendPoll(botToken, {
						chat_id: chatId,
						question: "Question?",
					}),
				);
			}),
		);

		test.effect("PollMustHaveAtLeastOneAnswerOption when options is empty", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendPoll(botToken, {
					chat_id: chatId,
					question: "Question?",
					options: [],
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: poll must have at least one answer option");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendPoll(botToken, {
					chat_id: 0,
					question: "Question?",
					options: [{ text: "A" }, { text: "B" }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: chat not found");
			}),
		);
	});

	authErrorTests(test, token =>
		callSendPoll(token, { chat_id: 1, question: "Q?", options: [{ text: "A" }, { text: "B" }] }),
	);
});
