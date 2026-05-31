import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callReplaceManagedBotToken = (token: string, payload: unknown) =>
	callClient("replaceManagedBotToken", token, payload as never);

liveTests("replaceManagedBotToken", test => {
	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callReplaceManagedBotToken(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callReplaceManagedBotToken(token, { user_id: 0 }));
});
