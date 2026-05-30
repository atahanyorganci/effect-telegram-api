import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, requireBotToken } from "./helpers.ts";

const callSetMyDefaultAdministratorRights = (token: string, payload?: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMyDefaultAdministratorRights, payload);

describe("setMyDefaultAdministratorRights", () => {
	describe("success", () => {
		it.effect("returns true when called with no parameters", () =>
			Effect.gen(function* () {
				const result = yield* callSetMyDefaultAdministratorRights(requireBotToken());

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callSetMyDefaultAdministratorRights);
});
