import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callAnswerGuestQuery = (token: string, payload: unknown) =>
	callClient("answerGuestQuery", token, payload as never);

const minimalInlineQueryResult = {
	type: "article",
	id: "1",
	title: "t",
	input_message_content: { message_text: "m" },
} as const;

liveTests("answerGuestQuery", test => {
	describe("Telegram API errors", () => {
		test.effect("ResultNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callAnswerGuestQuery(botToken, { guest_query_id: "invalid" }));
			}),
		);
	});

	authErrorTests(test, token =>
		callAnswerGuestQuery(token, { guest_query_id: "invalid", result: minimalInlineQueryResult }),
	);
});
