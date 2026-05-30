import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetChatPermissions = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatPermissions, payload);

describe("setChatPermissions", () => {
	describe("Telegram API errors", () => {
		it.effect("CantChangePrivateChatPermissions when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetChatPermissions(botToken, {
					chat_id: chatId,
					permissions: { can_send_messages: true },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantChangePrivateChatPermissions>(
					error,
					"CantChangePrivateChatPermissions",
					"Bad Request: can't change private chat permissions",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetChatPermissions(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetChatPermissions(token, { chat_id: 0, permissions: {} }));
});
