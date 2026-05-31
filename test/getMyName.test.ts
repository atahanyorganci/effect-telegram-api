import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetMyName = (token: string, payload: unknown = {}) => callClient("getMyName", token, payload as never);

liveTests("getMyName", test => {
	describe("success", () => {
		test.effect("returns the bot display name", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const name = yield* callGetMyName(botToken);

				assert.strictEqual(typeof name.name, "string");
				assert.ok(name.name.length > 0);
			}),
		);
	});

	authErrorTests(test, token => callGetMyName(token));
});
