import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetChatMenuButton = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatMenuButton, payload);

describe("setChatMenuButton", () => {
	describe("success", () => {
		it.effect("returns true when setting the default commands menu button", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetChatMenuButton(botToken, {
					menu_button: { type: "commands" },
				});

				assert.strictEqual(result, true);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("MenuButtonUnsupportedType when menu_button type is invalid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetChatMenuButton(botToken, {
					menu_button: { type: "invalid" },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MenuButtonUnsupportedType>(
					error,
					"MenuButtonUnsupportedType",
					"Bad Request: can't parse menu button: MenuButton has unsupported type",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetChatMenuButton(token, { menu_button: { type: "commands" } }));
});
