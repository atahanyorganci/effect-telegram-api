import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetMyCommands = (token: string, payload?: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getMyCommands, payload);

describe("getMyCommands", () => {
	describe("success", () => {
		it.effect("returns the bot command list", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const commands = yield* callGetMyCommands(botToken);

				assert.ok(Array.isArray(commands));
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("BotCommandScopeChatIdMissing when chat scope omits chat_id", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetMyCommands(botToken, { scope: { type: "chat" } }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BotCommandScopeChatIdMissing>(
					error,
					"BotCommandScopeChatIdMissing",
					"Bad Request: can't parse BotCommandScope: Can't find field \"chat_id\"",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetMyCommands);
});
