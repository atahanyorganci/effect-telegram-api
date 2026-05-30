import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetMyDescription = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMyDescription, payload);

describe("setMyDescription", () => {
	describe("success", () => {
		it.effect("returns true when clearing the bot description", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetMyDescription(botToken, { description: "" });

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetMyDescription(token, { description: "" }));
});
