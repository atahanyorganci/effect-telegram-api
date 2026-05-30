import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

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

	describe("Telegram API errors", () => {
		it.effect("Unauthorized when the token has bot id:hash form but the secret is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callGetMe("0000000000:INVALID_TOKEN").pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.Unauthorized>(error, "Unauthorized", "Unauthorized: invalid token specified");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NotFound when the token segment is empty", () =>
			Effect.gen(function* () {
				const error = yield* callGetMe("").pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NotFound>(error, "NotFound", "Not Found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NotFound when the token is not in bot id:hash form", () =>
			Effect.gen(function* () {
				const error = yield* callGetMe("not-a-valid-token").pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NotFound>(error, "NotFound", "Not Found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
