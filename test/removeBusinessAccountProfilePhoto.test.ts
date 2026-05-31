import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callRemoveBusinessAccountProfilePhoto = (token: string, payload: unknown) =>
	callClient("removeBusinessAccountProfilePhoto", token, payload as never);

liveTests("removeBusinessAccountProfilePhoto", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when validation fails", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callRemoveBusinessAccountProfilePhoto(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callRemoveBusinessAccountProfilePhoto(token, { business_connection_id: "invalid" }));
});
