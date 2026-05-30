import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callAnswerCallbackQuery = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.answerCallbackQuery, payload);

describe("answerCallbackQuery", () => {
	describe("Telegram API errors", () => {
		it.effect("CallbackQueryIdInvalid when callback_query_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callAnswerCallbackQuery(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CallbackQueryIdInvalid>(
					error,
					"CallbackQueryIdInvalid",
					"Bad Request: query is too old and response timeout expired or query ID is invalid",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CallbackQueryIdInvalid when callback_query_id is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callAnswerCallbackQuery(requireBotToken(), { callback_query_id: "invalid" }).pipe(
					Effect.flip,
				);

				expectErrorTag<Telegram.Errors.CallbackQueryIdInvalid>(
					error,
					"CallbackQueryIdInvalid",
					"Bad Request: query is too old and response timeout expired or query ID is invalid",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callAnswerCallbackQuery(token, { callback_query_id: "invalid" }));
});
