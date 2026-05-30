import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { LiveLayer, requireBotToken } from "./helpers.ts";

describe("getAvailableGifts", () => {
	describe("success", () => {
		it.effect("returns the gifts catalog", () =>
			Effect.gen(function* () {
				const gifts = yield* Telegram.Client.callMethod(requireBotToken(), Telegram.Methods.getAvailableGifts);

				assert.ok(Array.isArray(gifts.gifts));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
