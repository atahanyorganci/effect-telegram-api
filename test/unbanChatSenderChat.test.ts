import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callUnbanChatSenderChat = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.unbanChatSenderChat, payload);

describe("unbanChatSenderChat", () => {
	describe("Telegram API errors", () => {
		it.effect("SenderChatIdEmpty when sender_chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callUnbanChatSenderChat(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.SenderChatIdEmpty>(
					error,
					"SenderChatIdEmpty",
					"Bad Request: sender_chat_id is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callUnbanChatSenderChat(token, { chat_id: 1 }));
});
