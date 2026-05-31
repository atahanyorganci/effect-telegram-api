import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callGetManagedBotToken = (token: string, payload: unknown) =>
	callClient("getManagedBotToken", token, payload as never);

liveTests("getManagedBotToken", test => {
	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetManagedBotToken(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetManagedBotToken(token, { user_id: 0 }));
});
