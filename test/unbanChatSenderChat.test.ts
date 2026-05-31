import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callUnbanChatSenderChat = (token: string, payload: unknown) =>
	callClient("unbanChatSenderChat", token, payload as never);

liveTests("unbanChatSenderChat", test => {
	describe("Telegram API errors", () => {
		test.effect("SenderChatIdEmpty when sender_chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callUnbanChatSenderChat(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callUnbanChatSenderChat(token, { chat_id: 1, sender_chat_id: 1 }));
});
