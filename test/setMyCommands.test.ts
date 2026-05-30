import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetMyCommands = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMyCommands, payload);

describe("setMyCommands", () => {
	describe("success", () => {
		it.effect("returns true when updating the bot command list", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const result = yield* callSetMyCommands(token, {
					commands: [{ command: "start", description: "Start the bot" }],
				});

				assert.strictEqual(result, true);
				yield* Telegram.Client.callMethod(token, Telegram.Methods.deleteMyCommands);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("BotCommandInvalid when command contains invalid characters", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "bad command", description: "Invalid" }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BotCommandInvalid>(
					error,
					"BotCommandInvalid",
					"Bad Request: BOT_COMMAND_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CommandMustBeNonEmpty when command string is empty", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "", description: "Missing command" }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CommandMustBeNonEmpty>(
					error,
					"CommandMustBeNonEmpty",
					"Bad Request: command must be non-empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CommandDescriptionMustBeNonEmpty when description is empty", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "start", description: "" }],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CommandDescriptionMustBeNonEmpty>(
					error,
					"CommandDescriptionMustBeNonEmpty",
					"Bad Request: command description must be non-empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetMyCommands(token, { commands: [] }));
});
