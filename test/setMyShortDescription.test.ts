import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetMyShortDescription = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMyShortDescription, payload);

describe("setMyShortDescription", () => {
	describe("success", () => {
		it.effect("returns true when clearing the bot short description", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetMyShortDescription(botToken, { short_description: "" });

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("BotShortDescriptionInvalid when short_description exceeds the limit", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyShortDescription(botToken, { short_description: "x".repeat(121) }).pipe(
					Effect.flip,
				);

				expectErrorTag<Telegram.Errors.BotShortDescriptionInvalid>(
					error,
					"BotShortDescriptionInvalid",
					"Bad Request: BOT_SHARETEXT_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetMyShortDescription(token, { short_description: "" }));
});
