import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { LiveLayer, requireBotToken } from "./helpers.ts";

describe("getMyDescription", () => {
	describe("success", () => {
		it.effect("returns the bot description", () =>
			Effect.gen(function* () {
				const description = yield* Telegram.Client.callMethod(requireBotToken(), Telegram.Methods.getMyDescription);

				assert.strictEqual(typeof description.description, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
