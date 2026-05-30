import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callSetBusinessAccountName = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountName, payload);

describe("setBusinessAccountName", () => {
	describe("Telegram API errors", () => {
		it.effect("FirstNameRequired when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callSetBusinessAccountName(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.FirstNameRequired>(
					error,
					"FirstNameRequired",
					'Bad Request: parameter "first_name" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetBusinessAccountName(token, { business_connection_id: "invalid", first_name: "Test" }));
});
