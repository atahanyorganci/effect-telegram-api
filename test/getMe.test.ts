import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetMe = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.getMe);

describe("getMe", () => {
	describe("success", () => {
		it.effect("returns the authenticated bot user when the token is valid", () =>
			Effect.gen(function* () {
				const me = yield* callGetMe(requireBotToken());

				assert.strictEqual(me.is_bot, true);
				assert.strictEqual(typeof me.id, "number");
				assert.strictEqual(typeof me.first_name, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetMe);
});
