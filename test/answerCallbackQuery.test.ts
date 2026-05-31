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

const callAnswerCallbackQuery = (token: string, payload: unknown) =>
	callClient("answerCallbackQuery", token, payload as never);

liveTests("answerCallbackQuery", test => {
	describe("Telegram API errors", () => {
		test.effect("CallbackQueryIdInvalid when callback_query_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callAnswerCallbackQuery(botToken, {}));
			}),
		);

		test.effect("CallbackQueryIdInvalid when callback_query_id is invalid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callAnswerCallbackQuery(botToken, { callback_query_id: "invalid" }).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CallbackQueryIdInvalid",
					"Bad Request: query is too old and response timeout expired or query ID is invalid",
				);
			}),
		);
	});

	authErrorTests(test, token => callAnswerCallbackQuery(token, { callback_query_id: "invalid" }));
});
