import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetAvailableGifts = (token: string) => callClient("getAvailableGifts", token);

liveTests("getAvailableGifts", test => {
	describe("success", () => {
		test.effect("returns the gifts catalog", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const gifts = yield* callGetAvailableGifts(botToken);

				assert.ok(Array.isArray(gifts.gifts));
			}),
		);
	});

	authErrorTests(test, token => callGetAvailableGifts(token));
});
