import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetMyCommands = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.getMyCommands);

describe("getMyCommands", () => {
	describe("success", () => {
		it.effect("returns the bot command list", () =>
			Effect.gen(function* () {
				const commands = yield* callGetMyCommands(requireBotToken());

				assert.ok(Array.isArray(commands));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetMyCommands);
});
