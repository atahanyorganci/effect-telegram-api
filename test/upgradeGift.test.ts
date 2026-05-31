import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callUpgradeGift = (token: string, payload: unknown) => callClient("upgradeGift", token, payload as never);

liveTests("upgradeGift", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callUpgradeGift(botToken, { business_connection_id: "invalid" }));
			}),
		);
	});

	authErrorTests(test, token =>
		callUpgradeGift(token, { business_connection_id: "invalid", owned_gift_id: "invalid" }),
	);
});
