import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, requireBotToken } from "./helpers.ts";

const callDeleteMyCommands = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.deleteMyCommands);

describe("deleteMyCommands", () => {
	describe("success", () => {
		it.effect("returns true when clearing the bot command list", () =>
			Effect.gen(function* () {
				const result = yield* callDeleteMyCommands(requireBotToken());

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callDeleteMyCommands);
});
