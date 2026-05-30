import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TelegramApiError } from "../src/Client.ts";
import * as Telegram from "../src/index.ts";

const LiveLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

const callGetMe = (token: string) => Telegram.Client.callMethod(token, Telegram.Methods.getMe);

const expectTelegramApiError = (
	error: unknown,
	expected: { readonly errorCode: number; readonly description: string },
) => {
	assert.strictEqual((error as TelegramApiError)._tag, "TelegramApiError");
	assert.strictEqual((error as TelegramApiError).errorCode, expected.errorCode);
	assert.strictEqual((error as TelegramApiError).description, expected.description);
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
		it.effect("401 when the token has bot id:hash form but the secret is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callGetMe("0000000000:INVALID_TOKEN").pipe(Effect.flip);

				expectTelegramApiError(error, {
					errorCode: 401,
					description: "Unauthorized: invalid token specified",
				});
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("404 when the token segment is empty", () =>
			Effect.gen(function* () {
				const error = yield* callGetMe("").pipe(Effect.flip);

				expectTelegramApiError(error, {
					errorCode: 404,
					description: "Not Found",
				});
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("404 when the token is not in bot id:hash form", () =>
			Effect.gen(function* () {
				const error = yield* callGetMe("not-a-valid-token").pipe(Effect.flip);

				expectTelegramApiError(error, {
					errorCode: 404,
					description: "Not Found",
				});
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
