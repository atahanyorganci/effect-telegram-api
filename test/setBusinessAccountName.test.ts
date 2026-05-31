import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSetBusinessAccountName = (token: string, payload: unknown) =>
	callClient("setBusinessAccountName", token, payload as never);

liveTests("setBusinessAccountName", test => {
	describe("Telegram API errors", () => {
		test.effect("FirstNameRequired when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetBusinessAccountName(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callSetBusinessAccountName(token, { business_connection_id: "invalid", first_name: "Test" }),
	);
});
