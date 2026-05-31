import { assert } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { TelegramClient } from "../src/client/service.ts";
import { authErrorTests, callGetMe, liveTests, withConfiguredBot } from "./helpers.ts";

liveTests("telegram", test => {
	test.effect("getMe returns the authenticated bot user when the token is valid", () =>
		withConfiguredBot(
			Effect.gen(function* () {
				const client = yield* TelegramClient;
				const me = yield* client.getMe();

				assert.strictEqual(me.is_bot, true);
				assert.strictEqual(typeof me.id, "number");
				assert.strictEqual(typeof me.first_name, "string");
			}),
		),
	);

	authErrorTests(test, token => callGetMe(token));
});
