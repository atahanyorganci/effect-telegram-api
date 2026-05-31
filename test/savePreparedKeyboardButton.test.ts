import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSavePreparedKeyboardButton = (token: string, payload: unknown) =>
	callClient("savePreparedKeyboardButton", token, payload as never);

liveTests("savePreparedKeyboardButton", test => {
	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSavePreparedKeyboardButton(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callSavePreparedKeyboardButton(token, { user_id: 0, button: { text: "test", request_id: "invalid" } }),
	);
});
