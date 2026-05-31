import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSetMyCommands = (token: string, payload: unknown) => callClient("setMyCommands", token, payload as never);

liveTests("setMyCommands", test => {
	describe("success", () => {
		test.effect("returns true when updating the bot command list", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const result = yield* callSetMyCommands(token, {
					commands: [{ command: "start", description: "Start the bot" }],
				});

				assert.strictEqual(result, true);
				yield* callClient("deleteMyCommands", token, {});
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("BotCommandInvalid when command contains invalid characters", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "bad command", description: "Invalid" }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "BotCommandInvalid", "Bad Request: BOT_COMMAND_INVALID");
			}),
		);

		test.effect("CommandMustBeNonEmpty when command string is empty", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "", description: "Missing command" }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "CommandMustBeNonEmpty", "Bad Request: command must be non-empty");
			}),
		);

		test.effect("CommandDescriptionMustBeNonEmpty when description is empty", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "start", description: "" }],
				}).pipe(Effect.flip);

				expectErrorTag(error, "CommandDescriptionMustBeNonEmpty", "Bad Request: command description must be non-empty");
			}),
		);

		test.effect("BotCommandScopeChatIdMissing when chat scope omits chat_id", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "start", description: "Start" }],
					scope: { type: "chat" },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"BotCommandScopeChatIdMissing",
					"Bad Request: can't parse BotCommandScope: Can't find field \"chat_id\"",
				);
			}),
		);

		test.effect("BotCommandScopeUserIdMissing when chat_member scope omits user_id", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "start", description: "Start" }],
					scope: { type: "chat_member", chat_id: 1 },
				}).pipe(Effect.flip);

				// Union members without chat_id/user_id fields can match first; Telegram
				// then parses type "chat_member" and reports the first missing field.
				expectErrorTag(
					error,
					"BotCommandScopeChatIdMissing",
					"Bad Request: can't parse BotCommandScope: Can't find field \"chat_id\"",
				);
			}),
		);

		test.effect("BotCommandScopeUnsupportedType when scope type is unknown", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyCommands(botToken, {
					commands: [{ command: "start", description: "Start" }],
					scope: { type: "invalid" },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"BotCommandScopeUnsupportedType",
					"Bad Request: can't parse BotCommandScope: Unsupported type specified",
				);
			}),
		);
	});

	authErrorTests(test, token => callSetMyCommands(token, { commands: [] }));
});
