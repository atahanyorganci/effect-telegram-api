import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callGetManagedBotAccessSettings = (token: string, payload: unknown) =>
	callClient("getManagedBotAccessSettings", token, payload as never);

liveTests("getManagedBotAccessSettings", test => {
	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetManagedBotAccessSettings(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetManagedBotAccessSettings(token, { user_id: 0 }));
});
