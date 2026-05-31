import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callGetMyCommands = (token: string, payload: unknown = {}) =>
	callClient("getMyCommands", token, payload as never);

liveTests("getMyCommands", test => {
	describe("success", () => {
		test.effect("returns the bot command list", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const commands = yield* callGetMyCommands(botToken);

				assert.ok(Array.isArray(commands));
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("BotCommandScopeChatIdMissing when chat scope omits chat_id", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetMyCommands(botToken, { scope: { type: "chat" } }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: can't parse BotCommandScope: Can't find field \"chat_id\"");
			}),
		);
	});

	authErrorTests(test, token => callGetMyCommands(token));
});
