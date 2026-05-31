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

const callAnswerWebAppQuery = (token: string, payload: unknown) =>
	callClient("answerWebAppQuery", token, payload as never);

const minimalInlineQueryResult = {
	type: "article",
	id: "1",
	title: "t",
	input_message_content: { message_text: "m" },
} as const;

liveTests("answerWebAppQuery", test => {
	describe("Telegram API errors", () => {
		test.effect("CallbackQueryIdInvalid when web_app_query_id is invalid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callAnswerWebAppQuery(botToken, {
					web_app_query_id: "invalid",
					result: { type: "article", id: "1", title: "t", input_message_content: { message_text: "m" } },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"BadRequest",
					"Bad Request: query is too old and response timeout expired or query ID is invalid",
				);
			}),
		);

		test.effect("ResultNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callAnswerWebAppQuery(botToken, { web_app_query_id: "invalid" }));
			}),
		);
	});

	authErrorTests(test, token =>
		callAnswerWebAppQuery(token, { web_app_query_id: "invalid", result: minimalInlineQueryResult }),
	);
});
