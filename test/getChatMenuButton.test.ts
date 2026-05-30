import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetChatMenuButton = (token: string, payload?: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getChatMenuButton, payload);

describe("getChatMenuButton", () => {
	describe("success", () => {
		it.effect("returns the default menu button when chat_id is omitted", () =>
			Effect.gen(function* () {
				const menuButton = yield* callGetChatMenuButton(requireBotToken());
				const button = menuButton as { readonly type: string };

				assert.strictEqual(typeof button.type, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("InvalidChatId when chat_id is not a valid private chat", () =>
			Effect.gen(function* () {
				const error = yield* callGetChatMenuButton(requireBotToken(), { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidChatId>(error, "InvalidChatId", "Bad Request: invalid chat_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetChatMenuButton(token));
});
