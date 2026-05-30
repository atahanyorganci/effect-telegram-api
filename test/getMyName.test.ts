import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetMyName = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.getMyName);

describe("getMyName", () => {
	describe("success", () => {
		it.effect("returns the bot display name", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const name = yield* callGetMyName(botToken);

				assert.strictEqual(typeof name.name, "string");
				assert.ok(name.name.length > 0);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetMyName);
});
