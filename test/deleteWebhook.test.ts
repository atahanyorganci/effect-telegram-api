import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callDeleteWebhook = (token: string, payload: unknown) => callClient("deleteWebhook", token, payload as never);

liveTests("deleteWebhook", test => {
	describe("success", () => {
		test.effect("returns true when removing webhook integration", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callDeleteWebhook(botToken, { drop_pending_updates: false });

				assert.strictEqual(result, true);
			}),
		);
	});

	authErrorTests(test, token => callDeleteWebhook(token, {}));
});
