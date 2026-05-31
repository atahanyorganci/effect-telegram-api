import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSetMyDescription = (token: string, payload: unknown) =>
	callClient("setMyDescription", token, payload as never);

liveTests("setMyDescription", test => {
	describe("success", () => {
		test.effect("returns true when clearing the bot description", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetMyDescription(botToken, { description: "" });

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("BotDescriptionInvalid when description exceeds the limit", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyDescription(botToken, { description: "x".repeat(513) }).pipe(Effect.flip);

				expectErrorTag(error, "BotDescriptionInvalid", "Bad Request: BOT_DESC_INVALID");
			}),
		);
	});

	authErrorTests(test, token => callSetMyDescription(token, { description: "" }));
});
