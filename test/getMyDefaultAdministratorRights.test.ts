import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetMyDefaultAdministratorRights = (token: string, payload: unknown = {}) =>
	callClient("getMyDefaultAdministratorRights", token, payload as never);

liveTests("getMyDefaultAdministratorRights", test => {
	describe("success", () => {
		test.effect("returns default administrator rights", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const rights = yield* callGetMyDefaultAdministratorRights(botToken);

				assert.strictEqual(typeof rights.can_manage_chat, "boolean");
			}),
		);
	});

	authErrorTests(test, token => callGetMyDefaultAdministratorRights(token));
});
