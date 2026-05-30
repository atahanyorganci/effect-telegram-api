import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { LiveLayer, requireBotToken } from "./helpers.ts";

describe("getMyName", () => {
	describe("success", () => {
		it.effect("returns the bot display name", () =>
			Effect.gen(function* () {
				const name = yield* Telegram.Client.callMethod(requireBotToken(), Telegram.Methods.getMyName);

				assert.strictEqual(typeof name.name, "string");
				assert.ok(name.name.length > 0);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
