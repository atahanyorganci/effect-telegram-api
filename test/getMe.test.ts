import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetMe = (token: string) => callClient("getMe", token);

liveTests("getMe", test => {
	describe("success", () => {
		test.effect("returns the authenticated bot user when the token is valid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const me = yield* callGetMe(botToken);

				assert.strictEqual(me.is_bot, true);
				assert.strictEqual(typeof me.id, "number");
				assert.strictEqual(typeof me.first_name, "string");
			}),
		);
	});

	authErrorTests(test, token => callGetMe(token));
});
