import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetUpdates = (token: string, payload: unknown) => callClient("getUpdates", token, payload as never);

liveTests("getUpdates", test => {
	describe("success", () => {
		test.effect("returns an array of updates with short polling", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* callClient("deleteWebhook", botToken, { drop_pending_updates: false });

				const updates = yield* callGetUpdates(botToken, { limit: 1, timeout: 0 });

				assert.strictEqual(Array.isArray(updates), true);
				for (const update of updates) {
					assert.strictEqual(typeof update.update_id, "number");
				}
			}),
		);
	});

	authErrorTests(test, token => callGetUpdates(token, { limit: 1, timeout: 0 }));
});
