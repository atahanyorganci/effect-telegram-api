import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Telegram from "../src/index.ts";

const LiveLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

const callGetMe = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.getMe);

const expectUnauthorized = (error: unknown, description: string) => {
	assert.strictEqual((error as Telegram.Errors.Unauthorized)._tag, "Unauthorized");
	assert.strictEqual((error as Telegram.Errors.Unauthorized).description, description);
};

const expectNotFound = (error: unknown, description: string) => {
	assert.strictEqual((error as Telegram.Errors.NotFound)._tag, "NotFound");
	assert.strictEqual((error as Telegram.Errors.NotFound).description, description);
};

describe("getMe", () => {
	describe("success", () => {
		it.effect("returns the authenticated bot user when the token is valid", () =>
			Effect.gen(function* () {
				const token = process.env.TELEGRAM_BOT_TOKEN;
				if (token === undefined || token === "") {
					assert.fail("TELEGRAM_BOT_TOKEN is not set (add it to .env)");
				}

				const me = yield* callGetMe(token);

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

				expectUnauthorized(error, "Unauthorized: invalid token specified");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NotFound when the token segment is empty", () =>
			Effect.gen(function* () {
				const error = yield* callGetMe("").pipe(Effect.flip);

				expectNotFound(error, "Not Found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("NotFound when the token is not in bot id:hash form", () =>
			Effect.gen(function* () {
				const error = yield* callGetMe("not-a-valid-token").pipe(Effect.flip);

				expectNotFound(error, "Not Found");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
