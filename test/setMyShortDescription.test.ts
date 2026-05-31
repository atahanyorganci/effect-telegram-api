import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSetMyShortDescription = (token: string, payload: unknown) =>
	callClient("setMyShortDescription", token, payload as never);

liveTests("setMyShortDescription", test => {
	describe("success", () => {
		test.effect("returns true when clearing the bot short description", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetMyShortDescription(botToken, { short_description: "" });

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("BotShortDescriptionInvalid when short_description exceeds the limit", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyShortDescription(botToken, { short_description: "x".repeat(121) }).pipe(
					Effect.flip,
				);

				expectErrorTag(error, "BadRequest", "Bad Request: BOT_SHARETEXT_INVALID");
			}),
		);
	});

	authErrorTests(test, token => callSetMyShortDescription(token, { short_description: "" }));
});
