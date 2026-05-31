import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSetChatMenuButton = (token: string, payload: unknown) =>
	callClient("setChatMenuButton", token, payload as never);

liveTests("setChatMenuButton", test => {
	describe("success", () => {
		test.effect("returns true when setting the default commands menu button", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const result = yield* callSetChatMenuButton(botToken, {
					menu_button: { type: "commands" },
				});

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("MenuButtonUnsupportedType when menu_button type is invalid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetChatMenuButton(botToken, {
					menu_button: { type: "invalid" },
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"MenuButtonUnsupportedType",
					"Bad Request: can't parse menu button: MenuButton has unsupported type",
				);
			}),
		);
	});

	authErrorTests(test, token => callSetChatMenuButton(token, { menu_button: { type: "commands" } }));
});
