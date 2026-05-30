import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callLeaveChat = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.leaveChat, payload);

describe("leaveChat", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatMemberStatusCantBeChangedInPrivateChats when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callLeaveChat(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatMemberStatusCantBeChangedInPrivateChats>(
					error,
					"ChatMemberStatusCantBeChangedInPrivateChats",
					"Bad Request: chat member status can't be changed in private chats",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callLeaveChat(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callLeaveChat(token, { chat_id: 0 }));
});
