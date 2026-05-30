import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callAnswerWebAppQuery = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.answerWebAppQuery, payload);

describe("answerWebAppQuery", () => {
	describe("Telegram API errors", () => {
		it.effect("CallbackQueryIdInvalid when web_app_query_id is invalid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callAnswerWebAppQuery(botToken, {
					web_app_query_id: "invalid",
					result: { type: "article", id: "1", title: "t", input_message_content: { message_text: "m" } },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CallbackQueryIdInvalid>(
					error,
					"CallbackQueryIdInvalid",
					"Bad Request: query is too old and response timeout expired or query ID is invalid",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ResultNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callAnswerWebAppQuery(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ResultNotSpecified>(
					error,
					"ResultNotSpecified",
					"Bad Request: result isn't specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callAnswerWebAppQuery(token, { web_app_query_id: "invalid", result: {} }));
});
