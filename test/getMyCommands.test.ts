import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { LiveLayer, requireBotToken } from "./helpers.ts";

describe("getMyCommands", () => {
	describe("success", () => {
		it.effect("returns the bot command list", () =>
			Effect.gen(function* () {
				const commands = yield* Telegram.Client.callMethod(requireBotToken(), Telegram.Methods.getMyCommands);

				assert.ok(Array.isArray(commands));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
