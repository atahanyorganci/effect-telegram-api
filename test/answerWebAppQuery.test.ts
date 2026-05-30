import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callAnswerWebAppQuery = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.answerWebAppQuery, payload);

describe("answerWebAppQuery", () => {
	describe("Telegram API errors", () => {
		it.effect("ResultNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callAnswerWebAppQuery(requireBotToken(), {}).pipe(Effect.flip);

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
