import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetMyName = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMyName, payload);

describe("setMyName", () => {
	describe("success", () => {
		it.effect("returns true when setting the current bot display name", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const current = yield* Telegram.Client.callMethod(token, Telegram.Methods.getMyName);
				const result = yield* callSetMyName(token, { name: current.name });

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("BotTitleInvalid when name is empty", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyName(botToken, { name: "" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BotTitleInvalid>(error, "BotTitleInvalid", "Bad Request: BOT_TITLE_INVALID");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("BotTitleInvalid when name is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyName(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BotTitleInvalid>(error, "BotTitleInvalid", "Bad Request: BOT_TITLE_INVALID");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetMyName(token, { name: "Test Bot" }));
});
