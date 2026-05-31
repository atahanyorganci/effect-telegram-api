import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callConvertGiftToStars = (token: string, payload: unknown) =>
	callClient("convertGiftToStars", token, payload as never);

liveTests("convertGiftToStars", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callConvertGiftToStars(botToken, { business_connection_id: "invalid" }));
			}),
		);
	});

	authErrorTests(test, token =>
		callConvertGiftToStars(token, { business_connection_id: "invalid", owned_gift_id: "invalid" }),
	);
});
