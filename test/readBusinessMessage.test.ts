import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callReadBusinessMessage = (token: string, payload: unknown) =>
	callClient("readBusinessMessage", token, payload as never);

liveTests("readBusinessMessage", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatIdentifierEmpty when validation fails", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callReadBusinessMessage(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callReadBusinessMessage(token, { business_connection_id: "invalid", chat_id: 1, message_id: 1 }),
	);
});
