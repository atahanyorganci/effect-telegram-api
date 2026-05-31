import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetMyDescription = (token: string, payload: unknown = {}) =>
	callClient("getMyDescription", token, payload as never);

liveTests("getMyDescription", test => {
	describe("success", () => {
		test.effect("returns the bot description", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const description = yield* callGetMyDescription(botToken);

				assert.strictEqual(typeof description.description, "string");
			}),
		);
	});

	authErrorTests(test, token => callGetMyDescription(token));
});
