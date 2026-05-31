import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSetMyDefaultAdministratorRights = (token: string, payload: unknown = {}) =>
	callClient("setMyDefaultAdministratorRights", token, payload as never);

liveTests("setMyDefaultAdministratorRights", test => {
	describe("success", () => {
		test.effect("returns true when called with no parameters", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetMyDefaultAdministratorRights(botToken);

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatAdministratorRightsCanDeleteMessagesMustBeBoolean when rights field has wrong type", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSetMyDefaultAdministratorRights(botToken, {
						rights: { can_delete_messages: "bad" },
					}),
				);
			}),
		);
	});

	authErrorTests(test, token => callSetMyDefaultAdministratorRights(token));
});
