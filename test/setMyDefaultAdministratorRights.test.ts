import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetMyDefaultAdministratorRights = (token: string, payload?: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMyDefaultAdministratorRights, payload);

describe("setMyDefaultAdministratorRights", () => {
	describe("success", () => {
		it.effect("returns true when called with no parameters", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetMyDefaultAdministratorRights(botToken);

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatAdministratorRightsCanDeleteMessagesMustBeBoolean when rights field has wrong type", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyDefaultAdministratorRights(botToken, {
					rights: { can_delete_messages: "bad" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatAdministratorRightsCanDeleteMessagesMustBeBoolean>(
					error,
					"ChatAdministratorRightsCanDeleteMessagesMustBeBoolean",
					'Bad Request: can\'t parse ChatAdministratorRights: Field "can_delete_messages" must be of type Boolean',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callSetMyDefaultAdministratorRights);
});
