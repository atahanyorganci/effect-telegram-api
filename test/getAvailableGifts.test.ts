import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetAvailableGifts = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.getAvailableGifts);

describe("getAvailableGifts", () => {
	describe("success", () => {
		it.effect("returns the gifts catalog", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const gifts = yield* callGetAvailableGifts(botToken);

				assert.ok(Array.isArray(gifts.gifts));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetAvailableGifts);
});
