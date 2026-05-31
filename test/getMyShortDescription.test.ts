import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetMyShortDescription = (token: string, payload: unknown = {}) =>
	callClient("getMyShortDescription", token, payload as never);

liveTests("getMyShortDescription", test => {
	describe("success", () => {
		test.effect("returns the bot short description", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const short = yield* callGetMyShortDescription(botToken);

				assert.strictEqual(typeof short.short_description, "string");
			}),
		);
	});

	authErrorTests(test, token => callGetMyShortDescription(token));
});
