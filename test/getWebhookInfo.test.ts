import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetWebhookInfo = (token: string) => callClient("getWebhookInfo", token);

liveTests("getWebhookInfo", test => {
	describe("success", () => {
		test.effect("returns current webhook status", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const info = yield* callGetWebhookInfo(botToken);

				assert.strictEqual(typeof info.url, "string");
				assert.strictEqual(typeof info.has_custom_certificate, "boolean");
				assert.strictEqual(typeof info.pending_update_count, "number");
			}),
		);
	});

	authErrorTests(test, token => callGetWebhookInfo(token));
});
