import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callAnswerGuestQuery = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.answerGuestQuery, payload);

describe("answerGuestQuery", () => {
	describe("Telegram API errors", () => {
		it.effect("ResultNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callAnswerGuestQuery(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ResultNotSpecified>(
					error,
					"ResultNotSpecified",
					"Bad Request: result isn't specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callAnswerGuestQuery(token, { guest_query_id: "invalid", result: {} }));
});
