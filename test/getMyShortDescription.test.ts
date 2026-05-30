import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { LiveLayer, requireBotToken } from "./helpers.ts";

describe("getMyShortDescription", () => {
	describe("success", () => {
		it.effect("returns the bot short description", () =>
			Effect.gen(function* () {
				const short = yield* Telegram.Client.callMethod(requireBotToken(), Telegram.Methods.getMyShortDescription);

				assert.strictEqual(typeof short.short_description, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
