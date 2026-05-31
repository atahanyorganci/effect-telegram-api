import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, formDataPayload, liveTests, telegramConfig } from "./helpers.ts";

const callSetWebhook = (token: string, payload: unknown) =>
	callClient("setWebhook", token, formDataPayload(payload as Record<string, unknown>) as never);

liveTests("setWebhook", test => {
	describe("success", () => {
		test.effect("returns true when clearing webhook integration with an empty URL", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetWebhook(botToken, { url: "", drop_pending_updates: false });

				assert.strictEqual(result, true);
			}),
		);
	});

	authErrorTests(test, token => callSetWebhook(token, { url: "" }));
});
