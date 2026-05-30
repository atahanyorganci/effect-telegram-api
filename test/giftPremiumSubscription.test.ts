import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGiftPremiumSubscription = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.giftPremiumSubscription, payload);

describe("giftPremiumSubscription", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGiftPremiumSubscription(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGiftPremiumSubscription(token, { user_id: 0, month_count: 1, star_count: 1 }));
});
