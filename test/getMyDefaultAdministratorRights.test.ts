import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { LiveLayer, requireBotToken } from "./helpers.ts";

describe("getMyDefaultAdministratorRights", () => {
	describe("success", () => {
		it.effect("returns default administrator rights", () =>
			Effect.gen(function* () {
				const rights = yield* Telegram.Client.callMethod(
					requireBotToken(),
					Telegram.Methods.getMyDefaultAdministratorRights,
				);

				assert.strictEqual(typeof rights.can_manage_chat, "boolean");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
