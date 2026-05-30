import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendPoll = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendPoll, payload);

describe("sendPoll", () => {
	describe("success", () => {
		it.effect("returns the sent poll message", () =>
			Effect.gen(function* () {
				const message = yield* callSendPoll(requireBotToken(), {
					chat_id: requireChatId(),
					question: "Favorite color?",
					options: ["Red", "Blue"],
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.poll?.id, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("TextMustBeNonEmpty when question is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendPoll(requireBotToken(), {
					chat_id: requireChatId(),
					options: ["A", "B"],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.TextMustBeNonEmpty>(
					error,
					"TextMustBeNonEmpty",
					"Bad Request: text must be non-empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseOptionsJsonObject when options is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendPoll(requireBotToken(), {
					chat_id: requireChatId(),
					question: "Question?",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseOptionsJsonObject>(
					error,
					"CantParseOptionsJsonObject",
					"Bad Request: can't parse options JSON object",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("PollMustHaveAtLeastOneAnswerOption when options is empty", () =>
			Effect.gen(function* () {
				const error = yield* callSendPoll(requireBotToken(), {
					chat_id: requireChatId(),
					question: "Question?",
					options: [],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PollMustHaveAtLeastOneAnswerOption>(
					error,
					"PollMustHaveAtLeastOneAnswerOption",
					"Bad Request: poll must have at least one answer option",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendPoll(requireBotToken(), {
					chat_id: 0,
					question: "Question?",
					options: ["A", "B"],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendPoll(token, { chat_id: 1, question: "Q?", options: ["A", "B"] }));
});
