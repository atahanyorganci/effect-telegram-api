import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callGetBusinessConnection = (token: string, payload: unknown) =>
	callClient("getBusinessConnection", token, payload as never);

liveTests("getBusinessConnection", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetBusinessConnection(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetBusinessConnection(token, { business_connection_id: "invalid" }));
});
