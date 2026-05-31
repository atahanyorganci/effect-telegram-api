import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSetMyName = (token: string, payload: unknown) => callClient("setMyName", token, payload as never);

liveTests("setMyName", test => {
	describe("success", () => {
		test.effect("returns true when setting the current bot display name", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const result = yield* callSetMyName(token, { name: "EffectApiDocsBot" });

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("BotTitleInvalid when name is empty", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyName(botToken, { name: "" }).pipe(Effect.flip);

				expectErrorTag(error, "BotTitleInvalid", "Bad Request: BOT_TITLE_INVALID");
			}),
		);

		test.effect("BotTitleInvalid when name is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyName(botToken, {}).pipe(Effect.flip);

				expectErrorTag(error, "BotTitleInvalid", "Bad Request: BOT_TITLE_INVALID");
			}),
		);
	});

	authErrorTests(test, token => callSetMyName(token, { name: "Test Bot" }));
});
