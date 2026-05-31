import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSetBusinessAccountGiftSettings = (token: string, payload: unknown) =>
	callClient("setBusinessAccountGiftSettings", token, payload as never);

liveTests("setBusinessAccountGiftSettings", test => {
	describe("Telegram API errors", () => {
		test.effect("AcceptedGiftTypesNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSetBusinessAccountGiftSettings(botToken, {
						business_connection_id: "invalid",
						show_gift_button: true,
					}),
				);
			}),
		);
	});

	authErrorTests(test, token =>
		callSetBusinessAccountGiftSettings(token, {
			business_connection_id: "invalid",
			show_gift_button: true,
			accepted_gift_types: {
				unlimited_gifts: true,
				limited_gifts: true,
				unique_gifts: true,
				premium_subscription: true,
				gifts_from_channels: true,
			},
		}),
	);
});
