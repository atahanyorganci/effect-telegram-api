import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callGetChatMenuButton = (token: string, payload: unknown = {}) =>
	callClient("getChatMenuButton", token, payload as never);

liveTests("getChatMenuButton", test => {
	describe("success", () => {
		test.effect("returns the default menu button when chat_id is omitted", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const menuButton = yield* callGetChatMenuButton(botToken);
				const button = menuButton as { readonly type: string };

				assert.strictEqual(typeof button.type, "string");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("InvalidChatId when chat_id is not a valid private chat", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetChatMenuButton(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: invalid chat_id specified");
			}),
		);
	});

	authErrorTests(test, token => callGetChatMenuButton(token, {}));
});
