import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetMyDescription = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.getMyDescription);

describe("getMyDescription", () => {
	describe("success", () => {
		it.effect("returns the bot description", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const description = yield* callGetMyDescription(botToken);

				assert.strictEqual(typeof description.description, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetMyDescription);
});
