import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callDeleteChatPhoto = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.deleteChatPhoto, payload);

describe("deleteChatPhoto", () => {
	describe("Telegram API errors", () => {
		it.effect("CantChangePrivateChatPhoto when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callDeleteChatPhoto(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantChangePrivateChatPhoto>(
					error,
					"CantChangePrivateChatPhoto",
					"Bad Request: can't change private chat photo",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callDeleteChatPhoto(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callDeleteChatPhoto(token, { chat_id: 0 }));
});
