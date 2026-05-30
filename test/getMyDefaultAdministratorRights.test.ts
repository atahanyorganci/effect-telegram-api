import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetMyDefaultAdministratorRights = (token: string) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getMyDefaultAdministratorRights);

describe("getMyDefaultAdministratorRights", () => {
	describe("success", () => {
		it.effect("returns default administrator rights", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const rights = yield* callGetMyDefaultAdministratorRights(botToken);

				assert.strictEqual(typeof rights.can_manage_chat, "boolean");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetMyDefaultAdministratorRights);
});
