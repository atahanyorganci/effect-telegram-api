import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSetManagedBotAccessSettings = (token: string, payload: unknown) =>
	callClient("setManagedBotAccessSettings", token, payload as never);

liveTests("setManagedBotAccessSettings", test => {
	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetManagedBotAccessSettings(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSetManagedBotAccessSettings(token, { user_id: 0, is_access_restricted: false }));
});
