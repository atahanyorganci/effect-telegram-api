import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callDeleteMyCommands = (token: string, payload: unknown = {}) =>
	callClient("deleteMyCommands", token, payload as never);

liveTests("deleteMyCommands", test => {
	describe("success", () => {
		test.effect("returns true when clearing the bot command list", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callDeleteMyCommands(botToken);

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("BotCommandScopeChatIdMissing when chat scope omits chat_id", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callDeleteMyCommands(botToken, { scope: { type: "chat" } }).pipe(Effect.flip);

				expectErrorTag(
					error,
					"BotCommandScopeChatIdMissing",
					"Bad Request: can't parse BotCommandScope: Can't find field \"chat_id\"",
				);
			}),
		);
	});

	authErrorTests(test, token => callDeleteMyCommands(token));
});
